import dbConnect from '../../config/dbConnect.js'; 
import User from '../../models/User.js'; 

export default async function handler(req, res) {
  // 1. Dito natin pupwersahin na kumonekta gamit ang iyong hardcoded utility
  try {
    await dbConnect();
  } catch (err) {
    console.error("❌ DB connection failed inside login route:", err);
    return res.status(500).json({ error: "Database connection failed", details: err.message });
  }

  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;

      // 2. Ligtas na itong mag-eexecute dahil nakakonekta na si dbConnect
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(401).json({ message: "Maling email o password!" });
      }

      // 3. Simple checking (Palitan niyo ito kung may bcrypt / encryption kayo)
      if (user.password !== password) {
        return res.status(401).json({ message: "Maling email o password!" });
      }
      
      // Success response para sa index.html niyo
      return res.status(200).json({ 
        status: "SUCCESS", 
        message: "Login successful", 
        user: { email: user.email, role: user.role || 'user' } 
      });

    } catch (error) {
      console.error("🔥 LOGIN ROUTE ERROR:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}