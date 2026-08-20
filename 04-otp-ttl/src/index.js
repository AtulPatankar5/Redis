import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

function generateOTP(phone) {
    return `otp:${phone}`;
}


app.post("/otp", async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(generateOTP(phone), otp, "EX", 30); // Set OTP with a TTL of 30 seconds
    res.json({ message: 'OTP Sent', otp });
})


app.post("/otp/verify", async (req, res) => {
    const { phone, otp } = req.body;
    const storedOTP = await redis.get(generateOTP(phone));
    if (storedOTP === null) {
        return res.status(400).json({ message: 'OTP has expired or is invalid' });
    }

    if (storedOTP === otp) {
        await redis.del(generateOTP(phone)); // Delete OTP after successful verification
        res.json({ message: 'OTP Verified' });
    } else {
        res.status(400).json({ message: 'Invalid OTP' });   
    }
})

app.get("/otp/:phone/ttl",async(req,res)=>{
    redis.ttl(generateOTP(req.params.phone)).then(ttl=>{
        res.json({ttl});
    });
})

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})