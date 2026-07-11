import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI Circle Tutor
  app.post("/api/tutor", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({ 
          text: "🦉 Chào em! Thầy Giáo Cú đây. Thầy sẵn sàng giải đáp thắc mắc về hình tròn rồi! (Lưu ý: API Key chưa được cấu hình đầy đủ trong Secrets, nhưng em vẫn có thể tự tay trải nghiệm và chơi các trò chơi tương tác vô cùng thú vị ở giao diện chính nhé!)" 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // System instruction in Vietnamese for the Circle Tutor
      const systemInstruction = 
        "Bạn là một Thầy Giáo Cú Vàng thông thái và vui vẻ, chuyên dạy Toán Tiểu học cho học sinh lớp 3 về chủ đề hình tròn (tâm, bán kính, đường kính). " +
        "Hãy nói chuyện bằng giọng điệu trìu mến, dễ thương, dễ hiểu, khuyến khích các em nhỏ học tập. " +
        "Sử dụng các biểu tượng cảm xúc (emoji) như 🦉, 🌸, 📏, 🎯, 🌟 một cách khéo léo. " +
        "Chỉ trả lời các câu hỏi liên quan đến hình học, toán tiểu học, đặc biệt là hình tròn và bài toán con bọ ngựa bò trên 3 hình tròn. " +
        "Nếu học sinh hỏi bất kỳ điều gì không liên quan đến toán học, hãy khéo léo và vui vẻ dẫn dắt các em quay lại bài học hình tròn nhé! " +
        "Hãy giải thích thật dễ hiểu các khái niệm: Tâm là điểm chính giữa; Bán kính là khoảng cách từ tâm đến một điểm trên đường tròn; Đường kính gấp 2 lần bán kính và đi qua tâm.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Đã xảy ra lỗi hệ thống với Thầy Giáo Cú." });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
