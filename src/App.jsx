import { useState, useEffect, useCallback } from "react";
import { 
  collection, getDocs, addDoc, doc, serverTimestamp, deleteDoc 
} from "firebase/firestore";
import { db } from "./firebase";
import PalpiteForm from "./PalpiteForm";
import PalpitesList from "./PalpitesList";

const ADMIN_PASSWORD = "123456";

export default function App() {
  const [pontuacaoFinal, setPontuacaoFinal] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [atualizar, setAtualizar] = useState(false);

  const carregarPontuacoes = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "resultados"));
      const acumulado = {};

      snapshot.forEach((docu) => {
        const dados = docu.data();
        if (dados.pontuacao) {
          Object.entries(dados.pontuacao).forEach(([nome, pontos]) => {
            acumulado[nome] = (acumulado[nome] || 0) + pontos;
          });
        }
      });

      setPontuacaoFinal(acumulado);
    } catch (error) {
      console.error("Erro ao carregar pontuações:", error);
    }
  }, []);

  useEffect(() => {
    carregarPontuacoes();
  }, [carregarPontuacoes, atualizar]);

  async function validarResultados(file) {
    if (!file) return;

    try {
      const texto = await file.text();
      const resultados = {};

      texto.split("\n").forEach((linha) => {
        const match = linha.trim().match(/^(.+?)\s+(\d+)\s*x\s*(\d+)\s+(.+)$/i);
        if (match) {
          const [, timeA, golsA, golsB, timeB] = match;
          resultados[`${timeA.trim()} x ${timeB.trim()}`] = {
            golsA: Number(golsA),
            golsB: Number(golsB),
          };
        }
      });

      const palpitesSnapshot = await getDocs(collection(db, "palpites"));
      const novaPontuacao = { ...pontuacaoFinal };

      palpitesSnapshot.forEach((docu) => {
        const p = docu.data();
        const chave = `${p.timeA} x ${p.timeB}`;
        const res = resultados[chave];
        if (!res) return;

        let pontos = 0;
        if (p.golsA === res.golsA && p.golsB === res.golsB) {
          pontos = 3;
        } else if (
          (p.golsA > p.golsB && res.golsA > res.golsB) ||
          (p.golsA < p.golsB && res.golsA < res.golsB) ||
          (p.golsA === p.golsB && res.golsA === res.golsB)
        ) {
          pontos = 1;
        }

        novaPontuacao[p.apostador] = (novaPontuacao[p.apostador] || 0) + pontos;
      });

      await addDoc(collection(db, "resultados"), {
        data: serverTimestamp(),
        pontuacao: novaPontuacao,
      });

      setPontuacaoFinal(novaPontuacao);
      alert("✅ Resultados validados e atualizados com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error("Erro na validação dos resultados:", error);
      alert("❌ Falha ao processar o arquivo. Verifique o formato.");
    }
  }

  async function zerarPontuacoes() {
    if (!confirm("⚠️ Deseja realmente zerar TODAS as pontuações e apostas?")) return;

    try {
      const resultadosSnap = await getDocs(collection(db, "resultados"));
      const deletarResultados = resultadosSnap.docs.map((docu) => deleteDoc(doc(db, "resultados", docu.id)));

      const palpitesSnap = await getDocs(collection(db, "palpites"));
      const deletarPalpites = palpitesSnap.docs.map((docu) => deleteDoc(doc(db, "palpites", docu.id)));

      await Promise.all([...deletarResultados, ...deletarPalpites]);

      setPontuacaoFinal({});
      alert("♻️ Todas as pontuações e apostas foram zeradas com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao zerar pontuações/apostas:", error);
      alert("❌ Não foi possível zerar as pontuações.");
    }
  }

  async function apagarPalpitesRodada() {
    if (!confirm("⚠️ Deseja realmente apagar TODOS os palpites da rodada?")) return;

    try {
      const palpitesSnap = await getDocs(collection(db, "palpites"));
      const deletarPalpites = palpitesSnap.docs.map((docu) =>
        deleteDoc(doc(db, "palpites", docu.id))
      );

      await Promise.all(deletarPalpites);
      alert("✅ Todos os palpites da rodada foram apagados!");
      setAtualizar(v => !v);
    } catch (error) {
      console.error("Erro ao apagar palpites:", error);
      alert("❌ Não foi possível apagar os palpites.");
    }
  }

  function pedirSenha() {
    const senha = prompt("Digite a senha de administrador:");
    if (senha === ADMIN_PASSWORD) {
      setIsAdmin(true);
    } else {
      alert("❌ Senha incorreta!");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-6 text-gray-100">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-2">Palpita Bola ⚽</h1>
          <p className="text-gray-300 text-lg font-medium">
            Faça seu palpite e acompanhe a pontuação geral em tempo real!
          </p>
        </header>

        <main className="space-y-10">
          <section className="bg-gray-800 rounded-3xl shadow-lg p-8">
            <PalpiteForm onPalpiteSalvo={() => setAtualizar((v) => !v)} />
          </section>

          <section className="bg-gray-800 rounded-3xl shadow-lg p-8">
            <PalpitesList atualizar={atualizar} />
          </section>

          <section className="bg-gray-800 rounded-3xl shadow-lg p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                 Pontuação Geral
              </h2>

              {!isAdmin ? (
                <button
                  onClick={pedirSenha}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-300"
                >
                  🔒 Admin
                </button>
              ) : (
                <div className="flex flex-wrap gap-4">
                  <label
                    htmlFor="file-input"
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition duration-300"
                  >
                    📂 Importar TXT
                    <input
                      id="file-input"
                      type="file"
                      accept=".txt"
                      onChange={(e) => validarResultados(e.target.files[0])}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={zerarPontuacoes}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition duration-300"
                  >
                    ♻️ Zerar Tudo
                  </button>

                  <button
                    onClick={apagarPalpitesRodada}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-5 py-2 rounded-lg shadow-md transition duration-300"
                  >
                    🗑 Apagar Palpites da Rodada
                  </button>
                </div>
              )}
            </div>

            {Object.keys(pontuacaoFinal).length > 0 ? (
              (() => {
                const ranking = Object.entries(pontuacaoFinal).sort((a, b) => b[1] - a[1]);
                const top3 = ranking.slice(0, 3);
                const resto = ranking.slice(3);

                return (
                  <div className="flex flex-col items-center">
                    {/* Pódio */}
                    <div className="flex items-end gap-6 mb-10">
                      {top3[1] && (
                        <div className="flex flex-col items-center">
                          <div className="bg-gray-600 rounded-t-lg w-20 h-32 flex items-center justify-center text-2xl font-bold">
                            🥈
                          </div>
                          <p className="mt-2 font-semibold">{top3[1][0]}</p>
                          <p className="text-indigo-400">{top3[1][1]} pts</p>
                        </div>
                      )}

                      {top3[0] && (
                        <div className="flex flex-col items-center">
                          <div className="bg-yellow-500 rounded-t-lg w-20 h-40 flex items-center justify-center text-2xl font-bold">
                            🥇
                          </div>
                          <p className="mt-2 font-semibold">{top3[0][0]}</p>
                          <p className="text-yellow-300 font-bold">{top3[0][1]} pts</p>
                        </div>
                      )}

                      {top3[2] && (
                        <div className="flex flex-col items-center">
                          <div className="bg-orange-500 rounded-t-lg w-20 h-28 flex items-center justify-center text-2xl font-bold">
                            🥉
                          </div>
                          <p className="mt-2 font-semibold">{top3[2][0]}</p>
                          <p className="text-orange-300">{top3[2][1]} pts</p>
                        </div>
                      )}
                    </div>

                    {/* Lista restante */}
                    {resto.length > 0 && (
                      <ul className="max-w-md w-full divide-y divide-gray-700 rounded-lg bg-gray-700 shadow-inner">
                        {resto.map(([nome, pontos]) => (
                          <li
                            key={nome}
                            className="flex justify-between px-6 py-3 font-medium text-gray-100 hover:bg-gray-600 transition"
                          >
                            <span>{nome}</span>
                            <span className="text-indigo-400 font-bold">{pontos} pts</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })()
            ) : (
              <p className="text-center text-gray-400 italic">Nenhuma pontuação registrada ainda.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
