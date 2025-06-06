
import { useState, useEffect } from "react";
import jsPDF from "jspdf";

const daysPerCycle = 5;
const maxDays = 20;

export default function App() {
  const [personas, setPersonas] = useState([]);
  const [calles, setCalles] = useState([]);
  const [nombrePersona, setNombrePersona] = useState("");
  const [nombreCalle, setNombreCalle] = useState("");
  const [itinerario, setItinerario] = useState({});

  useEffect(() => {
    const savedPersonas = JSON.parse(localStorage.getItem("personas") || "[]");
    const savedCalles = JSON.parse(localStorage.getItem("calles") || "[]");
    setPersonas(savedPersonas);
    setCalles(savedCalles);
  }, []);

  useEffect(() => {
    localStorage.setItem("personas", JSON.stringify(personas));
  }, [personas]);

  useEffect(() => {
    localStorage.setItem("calles", JSON.stringify(calles));
  }, [calles]);

  function agregarPersona() {
    if (nombrePersona && !personas.includes(nombrePersona)) {
      setPersonas([...personas, nombrePersona]);
      setNombrePersona("");
    }
  }

  function eliminarPersona(p) {
    setPersonas(personas.filter((persona) => persona !== p));
  }

  function agregarCalle() {
    if (nombreCalle && !calles.includes(nombreCalle)) {
      setCalles([...calles, nombreCalle]);
      setNombreCalle("");
    }
  }

  function eliminarCalle(c) {
    setCalles(calles.filter((calle) => calle !== c));
  }

  function generarItinerario() {
    const totalDias = maxDays;
    const callesPendientes = [...calles];
    const historial = {};
    const nuevoItinerario = {};

    for (let dia = 1; dia <= totalDias; dia++) {
      nuevoItinerario[`Día ${dia}`] = [];
      for (let persona of personas) {
        if (!historial[persona]) historial[persona] = [];

        const recientes = historial[persona].slice(-daysPerCycle);
        const calleDisponible = callesPendientes.find(
          (c) => !recientes.includes(c)
        );

        if (calleDisponible) {
          nuevoItinerario[`Día ${dia}`].push({ persona, calle: calleDisponible });
          historial[persona].push(calleDisponible);

          const index = callesPendientes.indexOf(calleDisponible);
          if (index > -1) callesPendientes.splice(index, 1);
        }
      }
    }
    setItinerario(nuevoItinerario);
  }

  function exportarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(12);
    let y = 10;

    doc.text("Calendario de Recorridos", 10, y);
    y += 10;

    Object.entries(itinerario).forEach(([dia, asignaciones]) => {
      doc.text(`${dia}:`, 10, y);
      y += 7;
      asignaciones.forEach(({ persona, calle }) => {
        doc.text(`- ${persona} → ${calle}`, 15, y);
        y += 7;
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
      });
      y += 5;
    });

    doc.save("recorridos.pdf");
  }

  return (
    <div style={{ padding: 16, fontFamily: "Arial" }}>
      <h1>SelecCalle</h1>

      <section>
        <h2>👤 Personas</h2>
        <input
          placeholder="Nombre de persona"
          value={nombrePersona}
          onChange={(e) => setNombrePersona(e.target.value)}
        />
        <button onClick={agregarPersona}>Agregar</button>
        <ul>
          {personas.map((p, i) => (
            <li key={i}>
              {p} <button onClick={() => eliminarPersona(p)}>Eliminar</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>🚧 Calles</h2>
        <input
          placeholder="Nombre de calle"
          value={nombreCalle}
          onChange={(e) => setNombreCalle(e.target.value)}
        />
        <button onClick={agregarCalle}>Agregar</button>
        <ul>
          {calles.map((c, i) => (
            <li key={i}>
              {c} <button onClick={() => eliminarCalle(c)}>Eliminar</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <button onClick={generarItinerario} disabled={personas.length === 0 || calles.length === 0}>
          Generar Itinerario
        </button>
        <button onClick={exportarPDF} disabled={Object.keys(itinerario).length === 0}>
          Exportar PDF
        </button>
      </section>

      {Object.keys(itinerario).length > 0 && (
        <section>
          <h2>📅 Calendario</h2>
          {Object.entries(itinerario).map(([dia, asignaciones], i) => (
            <div key={i}>
              <strong>{dia}</strong>
              <ul>
                {asignaciones.map(({ persona, calle }, j) => (
                  <li key={j}>
                    {persona} → {calle}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
