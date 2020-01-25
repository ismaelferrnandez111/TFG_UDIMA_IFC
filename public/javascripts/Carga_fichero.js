function selectedCensoFile(select) {
    if (typeof (FileReader) != "undefined") {
        var reader = new FileReader();
        reader.onload = function (e) {
            var rows = e.target.result.split("\n");
           
  document.getElementById("censoContent").value   = e.target.result;
           
        }
        reader.readAsText(select.censoInput.files[0]);
    } else {
        alert("This browser does not support HTML5.");
    }
} 

function selectedEmpresaFile(select) {

    if (typeof (FileReader) != "undefined") {
        var reader = new FileReader();
        reader.onload = function (e) {
            var rows = e.target.result.split("\n");
           
  document.getElementById("empresaContent").value   = e.target.result;
           
        }
        reader.readAsText(select.empresaInput.files[0]);
    } else {
        alert("This browser does not support HTML5.");
    }
} 

