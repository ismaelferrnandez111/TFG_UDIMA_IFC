function initViz() {
  var containerDiv = document.getElementById("vizContainer"),
    url = "https://public.tableau.com/views/Cuadrodemando1/Cuadrodemandos?:display_count=y&:origin=viz_share_link";
  var viz = new tableau.Viz(containerDiv, url);

}
//https://public.tableau.com/views/GraficosCensoLocales/Dashboard1?:display_count=y&:origin=viz_share_link
//"https://public.tableau.com/views/Poblacinpordistritos/Hoja1?:display_count=y&:origin=viz_share_link";