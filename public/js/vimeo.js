$(document).ready(function () {
    const idAjax = $('.processing[data-pr="false"]')
    if (idAjax.length > 0) {
        var i = setInterval(getSate, 5000)
    }
    function getSate() {
        $.get('/vimeo/state?id=' + idAjax.attr("data-id"), data => {
            if (!data.next) clearInterval(i)
            const newTil = `ID: ${data.id} - (${data.finish}/${data.total})`
            const per = idAjax.find('.progress-bar.progress-bar-striped')
            const til = idAjax.find('h6')
            per.width(data.percent + '%')
            til.text(newTil)
        })
    }
    $('.icon-close').click(event => {
        $.post('/vimeo/delete?id=' + event.target.id, data => {
            if (data === 1) {
                $(`.processing[data-id="${event.target.id}"]`).remove()
            }
        })
    })
})