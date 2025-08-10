import { useState } from "react";
import { db } from "./firebase";
import { collection, setDoc, doc } from "firebase/firestore";

const API_KEY = import.meta.env.VITE_API_FUTEBOL_TOKEN;
const API_URL = "https://api.api-futebol.com.br/v1/campeonatos/2/jogos"; // Série A

export default function ValidarResultados() {
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");

  const validarResultados = async () => {
    if (senha !== "1234") { // senha exemplo
      setMensagem("❌ Senha incorreta!");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      const data = await res.json();

      if (!data.jogos) {
        setMensagem("❌ Não foi possível obter os resultados.");
        return;
      }

      // Salvar resultados no Firestore
      for (const jogo of data.jogos) {
        if (jogo.placar_oficial_mandante !== null && jogo.placar_oficial_visitante !== null) {
          const jogoId = `${jogo.time_mandante.nome} x ${jogo.time_visitante.nome}`;
          await setDoc(doc(db, "resultados", jogoId), {
            jogo: jogoId,
            timeA: jogo.time_mandante.nome,
            timeB: jogo.time_visitante.nome,
            golsA: jogo.placar_oficial_mandante,
            golsB: jogo.placar_oficial_visitante,
            data: new Date(jogo.data_realizacao),
          });
        }
      }

      setMensagem("✅ Resultados validados e salvos com sucesso!");
    } catch (error) {
      console.error(error);
      setMensagem("❌ Erro ao validar resultados.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 text-gray-100 p-6 rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-5 text-center text-indigo-400">
        Validar Resultados (Admin)
      </h2>

      {mensagem && (
        <div
          className={`mb-5 text-center p-3 rounded ${
            mensagem.startsWith("✅")
              ? "bg-green-700 text-green-200"
              : "bg-red-700 text-red-200"
          }`}
        >
          {mensagem}
        </div>
      )}

      <input
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="Senha de admin"
        className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-700"
      />

      <button
        onClick={validarResultados}
        className="w-full bg-green-600 hover:bg-green-700 py-3 rounded text-white font-semibold"
      >
        Validar Resultados
      </button>
    </div>
  );
}
