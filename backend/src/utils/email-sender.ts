import nodemailer from 'nodemailer';
import 'dotenv/config';

export class EmailSender {
  private transporter;

  constructor() {
    // Usamos o atalho 'service: gmail' para não termos de configurar portas manualmente
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // The 16-character App Password
      },
    });
  }

  async sendFriendRequestEmail(receiverEmail: string, receiverName: string, senderName: string) {
    try {
      const mailOptions = {
        from: `"MastersBook RPG" <${process.env.SMTP_USER}>`, 
        to: receiverEmail, 
        subject: '🎲 Novo Pedido de Amizade!', 
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Olá, ${receiverName}!</h2>
            <p>O jogador <strong>${senderName}</strong> acabou de te enviar um pedido de amizade no MastersBook.</p>
            <p>Entre na sua conta agora para aceitar o convite e começarem a rolar os dados juntos!</p>
            <br/>
            <p>Um abraço,<br/>Equipe MastersBook</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 E-mail de notificação enviado com sucesso para ${receiverEmail}`);
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail de notificação:', error);
    }
  }
}