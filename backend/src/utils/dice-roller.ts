/**
 * Analisa uma notação de RPG (ex: "1d20+5", "2d6-1") e rola os dados.
 */
export const rollDice = (notation: string) => {
  // Regex para capturar: Quantidade (opcional), Faces, Sinal (opcional), Modificador (opcional)
  // Ex: "2d6+3" -> match[1]="2", match[2]="6", match[3]="+", match[4]="3"
  const regex = /^(\d*)d(\d+)(?:\s*([\+\-])\s*(\d+))?$/i;
  const match = notation.trim().match(regex);

  if (!match) {
    throw new Error('Notação de dados inválida. Use o formato "1d20" ou "2d6+3".');
  }

  const quantity = match[1] ? parseInt(match[1], 10) : 1;
  const faces = parseInt(match[2], 10);
  const sign = match[3] || '+';
  const modifier = match[4] ? parseInt(match[4], 10) : 0;

  if (quantity > 100 || faces > 1000) {
    throw new Error('Calma lá! Quantidade máxima: 100 dados. Faces máximas: 1000.');
  }

  const rolls: number[] = [];
  let sum = 0;

  for (let i = 0; i < quantity; i++) {
    // Math.random() gera entre 0 e 0.999. Multiplicamos pelas faces, arredondamos para baixo e somamos 1.
    const roll = Math.floor(Math.random() * faces) + 1;
    rolls.push(roll);
    sum += roll;
  }

  let finalTotal = sum;
  let modifierString = '';

  if (modifier > 0) {
    if (sign === '+') {
      finalTotal += modifier;
      modifierString = ` + ${modifier}`;
    } else {
      finalTotal -= modifier;
      modifierString = ` - ${modifier}`;
    }
  }

  // Monta a string no formato: "Rolaram 2d6+3 🎲 [4, 6] + 3 = 13"
  const details = `[${rolls.join(', ')}]${modifierString}`;
  const messageContent = `Rolou ${notation} 🎲 ${details} = **${finalTotal}**`;

  return {
    total: finalTotal,
    rolls,
    content: messageContent
  };
};