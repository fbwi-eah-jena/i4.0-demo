var productData = null;
var socket = null;
var lastOrderToken = null;

$(document).ready(function(){
    
    
    // WebSocket connection...
    socket = io.connect();

    socket.on('connect', function(){
        console.log('web socket connection established');
    }); 
    socket.on('order/accept', function (data){
        //console.log('received order accept...' + data);
        //console.log("lastOrderToken: "+lastOrderToken);
        let jsonData = null;
        try
        {
            jsonData = JSON.parse(data.toString());
        }
        catch(exc)
        {
            console.log(exc);
        }
        console.log("token: "+jsonData.token+" orderId:"+jsonData.orderId);
        if(jsonData.token == lastOrderToken)
        {
            //refresh order id display
            $("#receiptProductID").html("#"+jsonData.orderId);
        }
    });
    socket.on('disconnect', function (){
        console.log('web socket disconnected...')
    });
    
    console.log("trying to load product data...");
    $.get("json/products.json",function(data){
        console.log("product json loaded...");
        console.log(data);
        productData=data;
    });

    $('#orderPanel').hide();
    $('#receiptPanel').hide();
    $('.config-options').slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 2,
        centerMode: true,
        prevArrow:"<img class='a-left control-c prev slick-prev' src='../images/buttons/success-previous-button.png'>",
        nextArrow:"<img class='a-right control-c next slick-next' src='../images/buttons/success-next-button.png'>",
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            }
        ]
    });
    $('#orderButton').on('click', function(event){
        
        console.log("components count: "+productData.components.length)
        
        let currentIndex1 = $('#component_1').slick('slickCurrentSlide');
        $('#finalComponent1Value').html(getOptionNameById(1, currentIndex1+1));
        let currentIndex2 = $('#component_2').slick('slickCurrentSlide');
        $('#finalComponent2Value').html(getOptionNameById(2, currentIndex2+1));
        let currentIndex3 = $('#component_3').slick('slickCurrentSlide');
        $('#finalComponent3Value').html(getOptionNameById(3, currentIndex3+1));
        let currentIndex4 = $('#component_4').slick('slickCurrentSlide');
        $('#finalComponent4Value').html(getOptionNameById(4, currentIndex4+1));
        
        $('#configPanel').hide();
        $('#orderPanel').fadeIn();
    });
    $('#backSubmitButton').on('click', function(event){
        $('#orderPanel').hide();
        $('#configPanel').fadeIn();
    });
    $('#submitButton').on('click', function(event){
        console.log("submitting order...");
        let currentIndex1 = $('#component_1').slick('slickCurrentSlide');
        let currentIndex2 = $('#component_2').slick('slickCurrentSlide');
        let currentIndex3 = $('#component_3').slick('slickCurrentSlide');
        let currentIndex4 = $('#component_4').slick('slickCurrentSlide');
        lastOrderToken = gernerateToken();
        let orderJSON =`
            {   "token" : "${lastOrderToken}",
                "name" : "unknown",
                "components": 
                [
                    {
                        "id": "1",
                        "name": "Fruit juice",
                        "options": [
                            {"id": "${currentIndex1+1}", "name": "${getOptionNameById(1, currentIndex1+1)}"}
                        ]
                    },
                    {
                        "id": "2",
                        "name": "Fruit puree",
                        "options": [
                            {"id": "${currentIndex2+1}", "name": "${getOptionNameById(2, currentIndex2+1)}"}
                        ]
                    },
                    {
                        "id": "3",
                        "name": "Fruit pieces",
                        "options": [
                            {"id": "${currentIndex3+1}", "name": "${getOptionNameById(3, currentIndex3+1)}"}
                        ]
                    },
                    {
                        "id": "4",
                        "name": "Alcohol",
                        "options": [
                            {"id": "${currentIndex4+1}", "name": "${getOptionNameById(4, currentIndex4+1)}"}
                        ]
                    }
                ] 
            }`;
        socket.emit("order",orderJSON);
        $('#submitButton').attr("disabled", "disabled");
        $('#orderPanel').hide();
        $('#receiptPanel').fadeIn();
    });
    $('#resetButton').on('click', function(event){
        location.reload();
    });
    
});

function getOptionNameById(compId, optionId)
{
    let nameToReturn = "unknown";
    for(component of this.productData.components)
    {
        if(component.id == compId)
        {
            for (option of component.options)
            {
                if(option.id == optionId)
                {
                    nameToReturn = option.name;
                    break;
                }
            }
            break;
        }
    }
    return nameToReturn;
}

function gernerateToken()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

