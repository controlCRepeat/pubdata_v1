import { useEffect, useRef } from "react";

export default function TableauEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const vizElement = document.createElement("object");
    vizElement.className = "tableauViz";
    vizElement.style.display = "block";
    vizElement.style.width = "100%";
    vizElement.style.height = "100%";

    const params = {
      host_url: "https%3A%2F%2Fpublic.tableau.com%2F",
      embed_code_version: "3",
      site_root: "",
      name: "OpenGovDataWorkbook/Dashboard-PopulationPyramid", // ✅ updated dashboard name
      tabs: "no",
      toolbar: "yes",
      static_image:
        "https://public.tableau.com/static/images/Op/OpenGovDataWorkbook/Dashboard-PopulationPyramid/1.png", // ✅ updated image
      animate_transition: "yes",
      display_static_image: "yes",
      display_spinner: "yes",
      display_overlay: "yes",
      display_count: "yes",
      language: "en-GB",
    };

    for (const [key, value] of Object.entries(params)) {
      const param = document.createElement("param");
      param.name = key;
      param.value = value;
      vizElement.appendChild(param);
    }

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(vizElement);

    const script = document.createElement("script");
    script.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
    vizElement.parentNode?.insertBefore(script, vizElement);

    return () => {
      // Cleanup if needed later
    };
  }, []);

  return (
    <div className="p-4 w-full">
      <h2 className="text-xl font-semibold mb-2">Dashboard - Population Pyramid</h2>
      <div
        className="relative overflow-hidden"
        style={{
          height: "400px", // or use a more dynamic height if needed
        }}
      >
        <div
          ref={containerRef}
          className="tableauPlaceholder"
          style={{ position: "relative", width: "100%", height: "100%" }}
        >
          <noscript>
            <a href="#">
              <img
                alt="Dashboard - Population Pyramid"
                src="https://public.tableau.com/static/images/Op/OpenGovDataWorkbook/Dashboard-PopulationPyramid/1_rss.png"
                style={{ border: "none" }}
              />
            </a>
          </noscript>
        </div>
      </div>
    </div>
  );
}
