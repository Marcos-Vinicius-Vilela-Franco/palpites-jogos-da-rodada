// Função central para pegar o logo correto do clube
export function getLogo(clube) {
  const mapaClubes = {
    "Bahia": "Bahia.png",
    "Atlético-MG": "Atlético-Mineiro.png",
    "Botafogo": "Botafogo.png",
    "Ceará": "Ceará.png",
    "Corinthians": "Corinthians.png",
    "Cruzeiro": "Cruzeiro.png",
    "Flamengo": "Flamengo.png",
    "Fluminense": "Fluminense.png",
    "Fortaleza": "Fortaleza.png",
    "Grêmio": "Grêmio.png", // sem acento no arquivo
    "Internacional": "Internacional.png",
    "Juventude": "Juventude.png",
    "Mirassol": "Mirassol-SP.png",
    "Palmeiras": "Palmeiras.png",
    "Bragantino": "Red-Bull-Bragantino.png",
    "Santos": "Santos.png",
    "São Paulo": "São-Paulo.png",
    "Sport": "Sport-Recife.png",
    "Vasco": "Vasco-da-Gama.png",
    "Vitória": "Vitória.png"
  };

  if (mapaClubes[clube]) {
    return `/clubes/${mapaClubes[clube]}`;
  }

  // fallback genérico
  const nomeArquivo = clube
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_") + ".png";

  return `/clubes/${nomeArquivo}`;
}
