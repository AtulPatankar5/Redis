import express from "express";
import Redis from "ioredis";

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");


//increment view count of user
app.post("/post/:id/view", async (req, res) => {
    try {
        const userid = req.params.id;
        const count = await redis.incr(`visits:${userid}`);
        res.json({
            user: userid,
            count: Number(count)
        })
    } catch (error) {
        res.status(500).json({ error: "internal Server error" });
    }

})

//increase score of user in leaderboard
app.post("/leaderboard/score", async (req, res) => {
    try {
        const { userId, score } = req.body;
        const newScore = await redis.zincrby(
            "leaderboard",
            score,
            userId
        );
        res.json({
            user: userId,
            score: Number(newScore)
        })
    } catch (error) {
        res.status(500).json({ error: "internal Server error" });
    }
})

//Top 10 leaders 
app.get("/leaderboard", async (req, res) => {
    try {
        const result = await redis.zrevrange("leaderboard", 0, 9, "WITHSCORES");
        const leaderboardArray = [];

        for (let i = 0; i < result.length; i += 2) {
            leaderboardArray.push({
                user: result[i],
                score: Number(result[i + 1])
            });
        }
        console.log({ result });
        res.json(leaderboardArray);
    } catch (error) {
        res.status(500).json({ error: "internal Server error" });
    }
})


//get rank of user 
app.get("/leaderboard/rank/:userid", async (req, res) => {
    try {

        const userId = req.params.userid;
        const rank = await redis.zrevrank("leaderboard", userId);

        if (rank == null) {
            res.status(404).json({ error: "User not found in leaderboard" });
        } else {
            res.json({ user: userId, rank: Number(rank) + 1 });
        }
    } catch (error) {
        res.status(500).json({ error: "internal Server error" });
    }
})

redis.on("connect", () => {
    console.log("Connected to Redis");
});

redis.on("error", (err) => {
    console.error("Redis Error:", err);
});


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});