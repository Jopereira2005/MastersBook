import nodemailer from 'nodemailer';
import 'dotenv/config';

export class EmailSender {
  private transporter;

  constructor() {
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

  async sendInviteAcceptedEmail(senderEmail: string, senderName: string, accepterName: string) {
    try {
      const mailOptions = {
        from: `"MastersBook RPG" <${process.env.SMTP_USER}>`, 
        to: senderEmail, // Enviamos de volta para quem mandou o convite original
        subject: '🎉 O seu convite de amizade foi aceito!', 
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Boas notícias, ${senderName}!</h2>
            <p>O jogador <strong>${accepterName}</strong> acabou de aceitar o seu pedido de amizade no MastersBook.</p>
            <p>Vocês já podem criar mesas e compartilhar fichas juntos. Acesse a plataforma e comece a sua campanha!</p>
            <br/>
            <p>Um abraço,<br/>Equipe MastersBook</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 E-mail de 'Convite Aceito' enviado com sucesso para ${senderEmail}`);
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail de aceite:', error);
    }
  }
}