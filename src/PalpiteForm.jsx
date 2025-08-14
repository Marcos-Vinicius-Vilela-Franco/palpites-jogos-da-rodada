import { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

const TIMES = [
  "Atlético-MG", "Bahia", "Botafogo", "Bragantino", "Ceará", "Corinthians", "Cruzeiro",
  "Flamengo", "Fluminense", "Fortaleza", "Grêmio", "Internacional", "Juventude", "Mirassol",
  "Palmeiras", "Santos", "São Paulo", "Sport", "Vasco", "Vitória",
];

const APOSTADORES = ["Daniel", "Marcos", "Alexandre"];

export default function PalpiteForm() {
  const [apostador, setApostador] = useState("");
  const [timeA, setTimeA] = useState("");
  const [timeB, setTimeB] = useState("");
  const [golsA, setGolsA] = useState("");
  const [golsB, setGolsB] = useState("");
  const [mensagem, setMensagem] = useState(null);
  const [tipoMensagem, setTipoMensagem] = useState("info");

  const limparFormulario = () => {
    setApostador("");
    setTimeA("");
    setTimeB("");
    setGolsA("");
    setGolsB("");
  };

  const salvarPalpite = async (e) => {
    e.preventDefault();

    if (!apostador || !timeA || !timeB || golsA === "" || golsB === "") {
      setMensagem("Por favor, preencha todos os campos.");
      setTipoMensagem("error");
      return;
    }

    if (timeA === timeB) {
      setMensagem("Os times não podem ser iguais.");
      setTipoMensagem("error");
      return;
    }

    if (parseInt(golsA) < 0 || parseInt(golsB) < 0) {
      setMensagem("Gols não podem ser negativos.");
      setTipoMensagem("error");
      return;
    }

    try {
      await addDoc(collection(db, "palpites"), {
        apostador,
        jogo: `${timeA} x ${timeB}`,
        timeA,
        timeB,
        golsA: parseInt(golsA),
        golsB: parseInt(golsB),
        data: new Date(),
      });

      setMensagem("✅ Palpite salvo com sucesso!");
      setTipoMensagem("success");
      limparFormulario();

      setTimeout(() => {
        setMensagem(null);
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Erro ao salvar palpite:", error);
      setMensagem("❌ Erro ao salvar palpite. Tente novamente.");
      setTipoMensagem("error");
    }
  };

  const selectStyle =
    "w-full rounded-xl border border-gray-700 bg-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none";

  return (
    <form
      onSubmit={salvarPalpite}
      className="max-w-md mx-auto bg-gray-900 text-gray-100 rounded-2xl shadow-2xl p-8 space-y-6"
      noValidate
    >
      <h2 className="text-3xl font-extrabold text-indigo-400 text-center">Novo Palpite</h2>

      {mensagem && (
        <div
          role="alert"
          className={`rounded-md p-3 text-center font-semibold transition-colors ${
            tipoMensagem === "success"
              ? "bg-green-900 text-green-300"
              : tipoMensagem === "error"
              ? "bg-red-900 text-red-300"
              : "bg-indigo-900 text-indigo-300"
          }`}
        >
          {mensagem}
        </div>
      )}

      <div className="space-y-4">
        <label className="block text-sm font-semibold">Apostador</label>
        <select
          value={apostador}
          onChange={(e) => setApostador(e.target.value)}
          className={selectStyle}
        >
          <option value="" disabled>Selecione o apostador</option>
          {APOSTADORES.map((nome) => (
            <option key={nome} value={nome}>{nome}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold">Time A</label>
            <select
              value={timeA}
              onChange={(e) => setTimeA(e.target.value)}
              className={selectStyle}
              required
            >
              <option value="" disabled>Selecione o Time A</option>
              {TIMES.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold">Time B</label>
            <select
              value={timeB}
              onChange={(e) => setTimeB(e.target.value)}
              className={selectStyle}
              required
            >
              <option value="" disabled>Selecione o Time B</option>
              {TIMES.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold">Placar</label>
          <div className="flex items-center justify-center gap-4 mt-1">
            <input
              type="number"
              min="0"
              placeholder="Gols A"
              value={golsA}
              onChange={(e) => setGolsA(e.target.value)}
              className="w-20 rounded-xl border border-gray-700 bg-gray-800 text-center p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              required
            />
            <span className="text-2xl font-extrabold text-indigo-400 select-none">x</span>
            <input
              type="number"
              min="0"
              placeholder="Gols B"
              value={golsB}
              onChange={(e) => setGolsB(e.target.value)}
              className="w-20 rounded-xl border border-gray-700 bg-gray-800 text-center p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-500 hover:bg-indigo-600 transition-colors rounded-xl py-3 text-white font-semibold shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-400"
      >
        Salvar Palpite
      </button>
    </form>
  );
}
