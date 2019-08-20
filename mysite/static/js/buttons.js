function loadname()
{
    var inputs = document.querySelectorAll('.inputfile');
    Array.prototype.forEach.call(inputs, function( input )
    {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener( 'change', function(e)
        {
            console.log(this.files[0].name);
            var fileName = '';
            fileName = this.files[0].name;
            if( fileName )
                label.querySelector( 'span' ).innerHTML = fileName;
            else
                label.innerHtml = labelVal;
        });
    });
};

document.addEventListener("DOMContentLoaded", loadname);