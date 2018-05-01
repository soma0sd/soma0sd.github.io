function rowHeight(selector){
  $(selector).ready(function (){
    let MaxColHeight = 0;
    $(selector).each(function (){
      if(MaxColHeight < $(this).height()){
        MaxColHeight = $(this).height();
      }
    });
    $(selector).each(function (){
      $(this).height(MaxColHeight);
    });
  });
}

$(document).ready(function(){
  rowHeight("#section-works .col");
  rowHeight("#section-education .col");
  rowHeight("#section-skills .col");
});

$(window).scroll(function() {
  let triger = $("nav").offset().top;
  if (window.pageYOffset == 0) {
    $("nav").removeClass("sticky");
    $("body").removeClass("sticky");
    return null;
  }
  if (window.pageYOffset >= triger) {
    $("nav").addClass("sticky");
    $("body").addClass("sticky");
  } else {
    $("nav").removeClass("sticky");
    $("body").removeClass("sticky");
  }
});
