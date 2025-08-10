import { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

const TIMES = [
  "Atlético-MG",
  "Bahia",
  "Botafogo",
  "Bragantino",
  "Ceará",
  "Corinthians",
  "Cruzeiro",
  "Flamengo",
  "Fluminense",
  "Fortaleza",
  "Grêmio",
  "Internacional",
  "Juventude",
  "Mirassol",
  "Palmeiras",
  "Santos",
  "São Paulo",
  "Sport",
  "Vasco",
  "Vitória",
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
        window.location.reload(); // 🔹 Atualiza a página
      }, 1000);

    } catch (error) {
      console.error("Erro ao salvar palpite:", error);
      setMensagem("❌ Erro ao salvar palpite. Tente novamente.");
      setTipoMensagem("error");
    }
  };

  return (
    <form
      onSubmit={salvarPalpite}
      className="max-w-md mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-xl p-8 space-y-6"
      noValidate
    >
      <h2 className="text-3xl font-extrabold text-indigo-600 text-center">Novo Palpite</h2>

      {mensagem && (
        <div
          role="alert"
          className={`rounded-md p-3 text-center font-semibold ${
            tipoMensagem === "success"
              ? "bg-green-100 text-green-700"
              : tipoMensagem === "error"
              ? "bg-red-100 text-red-700"
              : "bg-indigo-100 text-indigo-700"
          }`}
        >
          {mensagem}
        </div>
      )}

      <div>
        <label htmlFor="apostador" className="block mb-1 font-semibold">
          Apostador
        </label>
        <select
          id="apostador"
          value={apostador}
          onChange={(e) => setApostador(e.target.value)}
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="" disabled>
            Selecione o apostador
          </option>
          {APOSTADORES.map((nome) => (
            <option key={nome} value={nome}>
              {nome}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="timeA" className="block mb-1 font-semibold">
            Time A
          </label>
          <select
            id="timeA"
            value={timeA}
            onChange={(e) => setTimeA(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="" disabled>
              Selecione o Time A
            </option>
            {TIMES.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="timeB" className="block mb-1 font-semibold">
            Time B
          </label>
          <select
            id="timeB"
            value={timeB}
            onChange={(e) => setTimeB(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="" disabled>
              Selecione o Time B
            </option>
            {TIMES.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Placar</label>
        <div className="flex items-center justify-center gap-4">
          <input
            type="number"
            min="0"
            aria-label="Gols do Time A"
            placeholder="Gols Time A"
            value={golsA}
            onChange={(e) => setGolsA(e.target.value)}
            className="w-20 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <span className="text-2xl font-extrabold text-indigo-600 select-none">x</span>
          <input
            type="number"
            min="0"
            aria-label="Gols do Time B"
            placeholder="Gols Time B"
            value={golsB}
            onChange={(e) => setGolsB(e.target.value)}
            className="w-20 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg py-3 text-white font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-400"
      >
        Salvar Palpite
      </button>
    </form>
  );
}
