
var Transportlistdata = [];

$(document).ready(function() {
	
	populateTable();
	
	
	//bei Tabellen in Tabs:
	//document.getElementById("defaultOpen").click();
	
	
	//Tabelle aktualisieren
	setInterval( function () {
		populateTable();  
	}, 10000 );
	

    // Löschen/Erledigt
    $('#Transportlist table tbody').on('click', 'td a.linkdelete', deleteInfo);
	
});


function populateTable() {

    var tableContent = '';

	
    $.getJSON( 'tsdata/tsdatalist', function( data ) {

        Transportlistdata = data;
		
		
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td>' + this.productId +  '</td>';
			//tableContent += '<td>' + this.components[0].value + ' ' + this.components[0].name + '</td>';
            tableContent += '<td>' + this.workingstation + '</td>';
            tableContent += '<td><a href="#" class="linkdelete" style="text-decoration: none; "rel="' + this._id + '">&#10004;</a></td>';
            tableContent += '</tr>';
        });
		
        // in Tabelle schreiben
        $('#Transportlist table tbody').html(tableContent);
    });
};


// Eintrag löschen --> Erledigt
function deleteInfo(event) {

    event.preventDefault();
	

        $.ajax({
            type: 'DELETE',
            url: '/tsdata/deleteinfo/' + $(this).attr('rel')
        }).done(function( response ) {

		
            //Erfolgreich gelöscht?
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }
            
			
            populateTable();

        });

    };

	
// mehrere Tabellen in Tabs darstellen
/*function openTable(evt, tableName) {
    
    var i, tabcontent, tablinks;

    // "tabcontent" wird versteckt
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // bei alle elementen mit "tablinks" wird "active" entfernt 
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Aktuellen Tab anzeigen + auf "active" setzen 
    document.getElementById(tableName).style.display = "block";
    evt.currentTarget.className += " active";
} 
 */
