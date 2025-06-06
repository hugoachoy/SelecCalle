// MVP de organización de recorridos callejeros con persistencia, edición y exportación PDF
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from "jspdf";

const daysPerCycle = 5;
const maxDays = 20;

export default function RecorridosMVP() {
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
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="space-y-2 p-4">
          <h2 className="text-xl font-semibold">Personas</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Nombre de persona"
              value={nombrePersona}
              onChange={(e) => setNombrePersona(e.target.value)}
            />
            <Button onClick={agregarPersona}>Agregar</Button>
          </div>
          <ul>
            {personas.map((p, i) => (
              <li key={i} className="flex justify-between items-center">
                <span>✅ {p}</span>
                <Button variant="outline" onClick={() => eliminarPersona(p)}>
                  ❌
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4">
          <h2 className="text-xl font-semibold">Calles</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Nombre de calle"
              value={nombreCalle}
              onChange={(e) => setNombreCalle(e.target.value)}
            />
            <Button onClick={agregarCalle}>Agregar</Button>
          </div>
          <ul>
            {calles.map((c, i) => (
              <li key={i} className="flex justify-between items-center">
                <span>🚧 {c}</span>
                <Button variant="outline" onClick={() => eliminarCalle(c)}>
                  ❌
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={generarItinerario} disabled={personas.length === 0 || calles.length === 0}>
          Generar Itinerario
        </Button>
        <Button onClick={exportarPDF} disabled={Object.keys(itinerario).length === 0}>
          Exportar PDF
        </Button>
      </div>

      {Object.keys(itinerario).length > 0 && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="text-xl font-semibold">Calendario de Recorridos</h2>
            {Object.entries(itinerario).map(([dia, asignaciones], i) => (
              <div key={i} className="border-t pt-2">
                <strong>{dia}</strong>
                <ul>
                  {asignaciones.map(({ persona, calle }, j) => (
                    <li key={j}>
                      👤 {persona} → 🚶‍♂️ {calle}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
