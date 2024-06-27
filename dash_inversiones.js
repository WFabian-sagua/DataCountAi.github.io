$(document).ready(function() {
    const dataUrl = 'data.json'; // URL del archivo JSON

    function fetchData(callback) {
        console.log('Cargando datos desde el archivo JSON...');
        $.getJSON(dataUrl, function(data) {
            callback(data.records); // Asume que la estructura de datos tiene un campo `records`
        })
        .fail(function(jqxhr, textStatus, error) {
            console.error('Error al obtener los datos:', error);
        });
    }

    fetchData(function(records) {
        console.log(records);

        // Llenar dropdowns
        fillDropdowns(records);

        // Crear gráfico de evolución financiera
        var trace1 = {
            x: records.map(record => record.FECHA_REGISTRO),
            y: records.map(record => record.MONTO_VIABLE),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Monto Viable'
        };

        var data1 = [trace1];
        var layout1 = {
            title: 'Evolución Financiera a lo largo del Tiempo',
            xaxis: { title: 'Fecha' },
            yaxis: { title: 'Monto (SOLES)' }
        };

        Plotly.newPlot('evolucion-financiera', data1, layout1);

        // Crear gráfico de distribución de inversiones por sector y entidad
        var sectorEntidad = {};
        records.forEach(record => {
            if (!sectorEntidad[record.SECTOR]) {
                sectorEntidad[record.SECTOR] = {};
            }
            if (!sectorEntidad[record.SECTOR][record.ENTIDAD]) {
                sectorEntidad[record.SECTOR][record.ENTIDAD] = 0;
            }
            sectorEntidad[record.SECTOR][record.ENTIDAD] += record.MONTO_VIABLE;
        });

        var treemapData = [];
        for (var sector in sectorEntidad) {
            for (var entidad in sectorEntidad[sector]) {
                treemapData.push({
                    type: 'treemap',
                    labels: [sector, entidad],
                    parents: ['', sector],
                    values: [null, sectorEntidad[sector][entidad]],
                    textinfo: "label+value",
                    domain: { column: 0 }
                });
            }
        }

        var layout2 = {
            title: 'Distribución de Inversiones por Sector y Entidad',
            grid: { rows: 1, columns: 1 }
        };

        Plotly.newPlot('distribucion-inversiones', treemapData, layout2);

        // Crear gráfico de comparación de avance físico por entidad
        var trace3 = {
            x: records.map(record => record.AVANCE_FISICO),
            y: records.map(record => record.ENTIDAD),
            type: 'bar',
            orientation: 'h'
        };

        var data3 = [trace3];
        var layout3 = {
            title: 'Comparación de Avance Físico por Entidad',
            xaxis: { title: 'Avance Físico' },
            yaxis: { title: 'Entidad' }
        };

        Plotly.newPlot('avance-fisico', data3, layout3);
    });

    $('#close-welcome-button').on('click', function() {
        $('#welcome-message').hide();
    });

    function fillDropdowns(records) {
        // Llenar el dropdown de sector
        var sectores = [...new Set(records.map(record => record.SECTOR))];
        var sectorDropdown = $('#sector-dropdown');
        sectores.forEach(sector => {
            sectorDropdown.append(new Option(sector, sector));
        });

        // Llenar el dropdown de departamento
        var departamentos = [...new Set(records.map(record => record.DEPARTAMENTO))];
        var departamentoDropdown = $('#departamento-dropdown');
        departamentos.forEach(departamento => {
            departamentoDropdown.append(new Option(departamento, departamento));
        });

        // Llenar el rango de años
        var years = [...new Set(records.map(record => new Date(record.FECHA_REGISTRO).getFullYear()))];
        var yearRangeSlider = $('#year-range-slider');
        years.sort().forEach(year => {
            yearRangeSlider.append(new Option(year, year));
        });
    }
});
