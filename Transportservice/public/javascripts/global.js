
var Transportlistdata = [];

$(document).ready(function() {
	
	populateTable();
	
	
	//update table
	setInterval( function () {
		populateTable();  
	}, 10000 );
	

    // delete ("Done")
    $('#Transportlist table tbody').on('click', 'td a.linkdelete', deleteInfo);
	
});


function populateTable() {

    var tableContent = '';

	
    $.getJSON( 'tsdata/tsdatalist', function( data ) {

        Transportlistdata = data;
		
		
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td>' + this.productId +  '</td>';
            tableContent += '<td>' + this.workingstation + '</td>';
            tableContent += '<td><a href="#" class="linkdelete" style="text-decoration: none; "rel="' + this._id + '">&#10004;</a></td>';
            tableContent += '</tr>';
        });
		
        // write in table
        $('#Transportlist table tbody').html(tableContent);
    });
};


// delete ("Done")
function deleteInfo(event) {

    event.preventDefault();
	

        $.ajax({
            type: 'DELETE',
            url: '/tsdata/deleteinfo/' + $(this).attr('rel')
        }).done(function( response ) {

		
            //deleted successfully?
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }
            
			
            populateTable();

        });

    };

	
