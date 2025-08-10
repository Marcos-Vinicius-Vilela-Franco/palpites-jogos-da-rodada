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

  const formatarHora = (dataFirebase) => {
    if (!dataFirebase) return "";
    const dateObj = dataFirebase.toDate ? dataFirebase.toDate() : new Date(dataFirebase);
    return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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
    <section className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
      <h2 className="text-4xl font-extrabold text-indigo-600 mb-10 text-center select-none">
        📋 Palpites por Apostador
      </h2>

      {Object.entries(palpites).map(([apostador, lista]) => (
        <div key={apostador} className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-300 border-b border-indigo-400 pb-2 select-none">
            {apostador}
          </h3>

          <ul className="space-y-5">
            {lista.map((palpite) => {
              const clubes = extrairClubes(palpite.jogo);
              const hora = formatarHora(palpite.data);

              return (
                <li
                  key={palpite.id}
                  className="bg-indigo-50 dark:bg-gray-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md hover:shadow-indigo-500 transition-shadow"
                >
                  {/* Clube A */}
                  <div className="flex items-center gap-3 min-w-[110px] flex-shrink-0">
                    <img
                      src={getLogo(clubes[0])}
                      alt={`${clubes[0]} logo`}
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                    />
                    <span className="font-semibold text-indigo-900 dark:text-indigo-300 truncate max-w-[90px]">
                      {clubes[0]}
                    </span>
                  </div>

                  {/* Placar */}
                  <div className="text-2xl font-bold bg-indigo-600 text-white rounded-lg px-6 py-1 min-w-[80px] text-center flex-shrink-0 shadow">
                    {palpite.golsA} x {palpite.golsB}
                  </div>

                  {/* Clube B */}
                  <div className="flex items-center gap-3 min-w-[110px] flex-shrink-0 justify-end">
                    <span className="font-semibold text-indigo-900 dark:text-indigo-300 truncate max-w-[90px]">
                      {clubes[1]}
                    </span>
                    <img
                      src={getLogo(clubes[1])}
                      alt={`${clubes[1]} logo`}
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                    />
                  </div>

                  {/* Hora */}
                  {hora && (
                    <time
                      dateTime={palpite.data?.toDate?.().toISOString() || ""}
                      className="text-indigo-500 font-mono text-sm text-center min-w-[50px] flex-shrink-0 select-none"
                      aria-label={`Hora do palpite: ${hora}`}
                    >
                      {hora}
                    </time>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
