import nodemailer from 'nodemailer';
import 'dotenv/config';

export class EmailSender {
  static sendWelcomeEmail(email: string, firstName: string) {
    throw new Error('Method not implemented.');
  }
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

  async sendWelcomeEmail(userEmail: string, firstName: string) {
    try {
      const mailOptions = {
        from: `"MastersBook RPG" <${process.env.SMTP_USER}>`, 
        to: userEmail,
        subject: '🎲 Bem-vindo ao MastersBook! Que sua jornada comece.', 
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px;">
            <h2 style="color: #2c3e50;">Olá, ${firstName}! Role iniciativa! 🐉</h2>
            <p>Estamos muito felizes em ter você na taverna do <strong>MastersBook</strong>.</p>
            <p>A sua conta foi criada com sucesso. A partir de agora, você tem o poder de criar fichas de personagens lendários, gerenciar campanhas épicas e convidar os seus amigos para a mesa.</p>
            <p>Prepare os seus dados, acesse o seu perfil e comece a sua primeira aventura!</p>
            <br/>
            <p>Um abraço e bons acertos críticos,<br/><strong>Equipe MastersBook</strong></p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 E-mail de 'Boas-vindas' enviado com sucesso para ${userEmail}`);
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail de boas-vindas:', error);
    }
  }
}