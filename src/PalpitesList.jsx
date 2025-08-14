import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { getLogo } from "./utils/getLogo";

export default function PalpitesList({ atualizar }) {
  const [palpites, setPalpites] = useState({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarPalpites() {
      setCarregando(true);
      try {
        const q = query(collection(db, "palpites"), orderBy("data", "desc"));
        const snapshot = await getDocs(q);

        const agrupados = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          const nome = data.apostador || "Sem Nome";

          if (!agrupados[nome]) agrupados[nome] = [];
          agrupados[nome].push({ id: doc.id, ...data });
        });

        setPalpites(agrupados);
      } catch (error) {
        console.error("Erro ao carregar palpites:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarPalpites();
  }, [atualizar]);

  const extrairClubes = (jogo) => jogo.split(" x ").map((clube) => clube.trim());

  if (carregando)
    return (
      <p className="mt-6 text-center text-gray-400 animate-pulse text-lg select-none">
        🔄 Carregando palpites...
      </p>
    );

  if (Object.keys(palpites).length === 0)
    return (
      <p className="mt-6 text-center text-gray-500 italic select-none">
        📭 Nenhum palpite registrado ainda.
      </p>
    );

  return (
    <section className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-900 rounded-3xl shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-8 text-indigo-400">
         Palpites por Apostador
      </h2>

      {Object.entries(palpites).map(([apostador, lista]) => (
        <div key={apostador} className="mb-10">
          {/* Nome do apostador com linha abaixo */}
          <h3 className="text-xl font-semibold text-white mb-1">{apostador}</h3>
          <div className="border-b border-gray-700 mb-4"></div>

          <ul className="space-y-4">
            {lista.map((palpite) => {
              const clubes = extrairClubes(palpite.jogo);

              // Formatar data/hora de forma legível
              const horario = palpite.data?.toDate
                ? palpite.data.toDate().toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <li
                  key={palpite.id}
                  className="bg-gray-800 text-white rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 gap-3 sm:gap-0"
                >
                  {/* Time A */}
                  <div className="flex items-center gap-2 min-w-[80px] sm:min-w-[100px]">
                    <img
                      src={getLogo(clubes[0])}
                      alt={`${clubes[0]} logo`}
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                    />
                    <span className="truncate">{clubes[0]}</span>
                  </div>

                  {/* Palpite no centro */}
                  <div className="flex flex-col items-center">
                    <div className="text-lg sm:text-xl font-bold bg-indigo-600 px-4 py-1 rounded">
                      {palpite.golsA} x {palpite.golsB}
                    </div>
                    {horario && (
                      <span className="text-gray-400 text-xs mt-1 select-none">
                        {horario}
                      </span>
                    )}
                  </div>

                  {/* Time B */}
                  <div className="flex items-center gap-2 min-w-[80px] sm:min-w-[100px] justify-end">
                    <span className="truncate">{clubes[1]}</span>
                    <img
                      src={getLogo(clubes[1])}
                      alt={`${clubes[1]} logo`}
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
