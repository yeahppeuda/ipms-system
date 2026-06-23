// ipms-backend/api/auth/login.js
import dbConnect from '../../config/dbConnect.js'; // Ayusin ang path depende kung nasaan ang file mo
import User from '../../models/User.js'; // Ito yung nakita nating User model mo sa structure niyo

export default async function handler(req, res) {
  // 1. Unang hakbang: Kumonekta muna sa DB gamit ang serverless method
  try {
    await dbConnect();
  } catch (err) {
    return res.status(500).json({ error: "Hindi makakonekta sa Database cluster." });
  }

  // 2. Saluhin ang POST request mula sa index.html niyo
  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;

      // 3. Hanapin ang user sa MongoDB gamit ang email
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(401).json({ message: "Maling email o password!" });
      }

      // 4. Dito niyo i-validate kung tama ang password (halimbawa kung gumagamit kayo ng bcrypt)
      // const isMatch = await user.comparePassword(password); // o bcrypt.compare
      
      // Kung tugma, mag-return ng success status para makapasok sa dashboard.html
      return res.status(200).json({ 
        status: "SUCCESS", 
        message: "Login successful", 
        user: { email: user.email, name: user.name } 
      });

    } catch (error) {
      console.error("🔥 LOGIN ROUTE ERROR:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}