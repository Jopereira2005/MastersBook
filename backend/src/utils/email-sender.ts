import 'dotenv/config';

export class EmailSender {
  private apiUrl = 'https://api.brevo.com/v3/smtp/email';
  private apiKey = process.env.BREVO_API_KEY as string;
  private senderEmail = process.env.SENDER_EMAIL as string;

  // CORES EXTRAÍDAS DO SEU INDEX.CSS (Convertidas de HSL para HEX)
  private colors = {
    bgDark: '#0A0A16',       // --background: 240 38% 6%
    cardDark: '#0F0F1F',     // --card: 240 35% 9%
    textLight: '#F3F2FA',    // --foreground: 250 30% 96%
    textMuted: '#9B9AA8',    // --muted-foreground: 245 15% 65%
    primary: '#8A3FFC',      // --primary: 265 89% 62%
    border: '#222238'        // --border: 250 25% 18%
  };

  /**
   * Template Base: Monta o "esqueleto" do e-mail.
   */
  private getBaseTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MastersBook</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: ${this.colors.bgDark}; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${this.colors.bgDark}; width: 100%; padding: 40px 20px;">
          <tr>
            <td align="center">
              
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: ${this.colors.cardDark}; border-radius: 16px; border: 1px solid ${this.colors.border}; overflow: hidden;">
                
                <tr>
                  <td align="center" style="padding: 40px 20px 20px 20px; border-bottom: 1px solid ${this.colors.border}; background-color: #0A0A16;">
                    <div style="color: ${this.colors.primary}; font-family: 'Cinzel', serif; font-size: 28px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                      <span style="font-size: 24px;">✨</span> MASTER'S<span style="color: ${this.colors.textLight};">BOOK</span>
                    </div>
                    <p style="color: ${this.colors.textMuted}; font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-top: 8px;">Sistema de RPG</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 40px 30px; color: ${this.colors.textLight}; font-family: 'Inter', sans-serif; font-size: 15px; line-height: 1.6;">
                    ${content}
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding: 30px; background-color: #0A0A16; border-top: 1px solid ${this.colors.border};">
                    <p style="color: ${this.colors.textMuted}; font-family: 'Inter', sans-serif; font-size: 12px; margin: 0;">
                      Que os seus dados rolem sempre 20 natural.
                    </p>
                    <p style="color: #4B4B63; font-family: 'Inter', sans-serif; font-size: 10px; margin-top: 10px;">
                      © ${new Date().getFullYear()} MastersBook RPG. Todos os direitos reservados.
                    </p>
                  </td>
                </tr>

              </table>
              </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private async sendEmail(toEmail: string, subject: string, htmlContent: string) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          sender: { 
            name: 'MastersBook RPG', 
            email: this.senderEmail 
          },
          to: [{ email: toEmail }],
          subject: subject,
          htmlContent: htmlContent
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro da API Brevo:', errorData);
        return;
      }
      
      console.log(`📧 E-mail '${subject}' enviado com sucesso para ${toEmail}`);
    } catch (error) {
      console.error('❌ Erro inesperado ao enviar e-mail:', error);
    }
  }

  // =========================================================================
  // MÉTODOS DE E-MAIL
  // =========================================================================

  async sendFriendRequestEmail(receiverEmail: string, receiverName: string, senderName: string) {
    const content = `
      <h2 style="color: ${this.colors.primary}; font-family: 'Cinzel', serif; margin-top: 0; font-size: 22px;">Olá, ${receiverName}!</h2>
      <p style="color: ${this.colors.textMuted};">Uma coruja acaba de trazer uma mensagem para você.</p>
      
      <div style="background-color: rgba(138, 63, 252, 0.1); border-left: 4px solid ${this.colors.primary}; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: ${this.colors.textLight};">O jogador <strong style="color: ${this.colors.primary};">${senderName}</strong> deseja entrar para a sua party e enviou um pedido de amizade.</p>
      </div>

      <p>Acesse a taverna agora para aceitar o aliado e começarem a forjar novas campanhas juntos!</p>
    `;
    
    const html = this.getBaseTemplate(content);
    await this.sendEmail(receiverEmail, '🎲 Novo Pedido de Amizade!', html);
  }

  async sendInviteAcceptedEmail(senderEmail: string, senderName: string, accepterName: string) {
    const content = `
      <h2 style="color: ${this.colors.primary}; font-family: 'Cinzel', serif; margin-top: 0; font-size: 22px;">Boas notícias, ${senderName}!</h2>
      
      <p style="color: ${this.colors.textLight};">O jogador <strong style="color: ${this.colors.primary};">${accepterName}</strong> aceitou o seu pacto de amizade no MastersBook.</p>
      <p style="color: ${this.colors.textMuted};">A vossa aliança está formada. A partir de agora, vocês podem convidar um ao outro para as mesas e compartilhar fichas lendárias.</p>
      
      <p style="margin-top: 30px;">Preparem as espadas e os feitiços!</p>
    `;
    
    const html = this.getBaseTemplate(content);
    await this.sendEmail(senderEmail, '🎉 O seu convite de amizade foi aceito!', html);
  }

  async sendWelcomeEmail(userEmail: string, firstName: string) {
    const content = `
      <h2 style="color: ${this.colors.primary}; font-family: 'Cinzel', serif; margin-top: 0; font-size: 22px;">Saudações, ${firstName}! Role iniciativa! 🐉</h2>
      
      <p style="color: ${this.colors.textMuted};">As portas da taverna estão oficialmente abertas para você.</p>
      
      <p>A sua conta no <strong>MastersBook</strong> foi forjada com sucesso. O seu grimório pessoal já está pronto para receber as suas criações.</p>
      
      <div style="margin: 30px 0;">
        <p style="margin-bottom: 10px; color: ${this.colors.primary}; font-weight: bold;">O que você pode fazer agora?</p>
        <ul style="color: ${this.colors.textMuted}; line-height: 1.8; padding-left: 20px; margin: 0;">
          <li>Criar fichas de personagens para diversos sistemas.</li>
          <li>Forjar novas campanhas como Mestre.</li>
          <li>Convidar aliados para a sua mesa através de Códigos Secretos.</li>
        </ul>
      </div>

      <p>Prepare os seus dados, acesse o seu perfil e comece a sua primeira aventura épica!</p>
    `;

    const html = this.getBaseTemplate(content);
    await this.sendEmail(userEmail, '✨ Bem-vindo ao MastersBook! Que a sua jornada comece.', html);
  }
}