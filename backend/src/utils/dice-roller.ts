// src/utils/dice-roller.ts

export const rollDice = (notation: string) => {
  // Regex para entender formatos como "1d20", "2d6+3", "d8-1"
  const regex = /^(\d*)d(\d+)(?:\s*([\+\-])\s*(\d+))?$/i;
  const match = notation.trim().match(regex);

  if (!match) {
    throw new Error('Notação de dados inválida. Use o formato "1d20" ou "2d6+3".');
  }

  // Se o jogador digitar apenas "d20", a quantidade será 1
  const quantity = match[1] ? parseInt(match[1], 10) : 1;
  const faces = parseInt(match[2], 10);
  const sign = match[3] || '+';
  const modifier = match[4] ? parseInt(match[4], 10) : 0;

  // Trava de segurança contra "bombas de processamento"
  if (quantity > 100 || faces > 1000) {
    throw new Error('Limite excedido. Máximo de 100 dados e 1000 faces.');
  }

  const rolls: number[] = [];
  let sum = 0;

  // Rola os dados individualmente
  for (let i = 0; i < quantity; i++) {
    const roll = Math.floor(Math.random() * faces) + 1;
    rolls.push(roll);
    sum += roll;
  }

  let finalTotal = sum;
  if (modifier > 0) {
    if (sign === '+') finalTotal += modifier;
    else finalTotal -= modifier;
  }

  // Exemplo de saída: "Rolou 1d20+5: **18** [13]"
  const content = `Rolou ${notation}: **${finalTotal}** [${rolls.join(', ')}]`;

  return { content };
};