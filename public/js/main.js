$(document).ready(function () {
    // Activate tooltip
    $('.edit, .delete').on('click', (e) => {
        let $this = $(e.currentTarget);
        if ($this.hasClass('delete')) {
            $('input.btn.btn-danger').on('click', () => {
                $.post(
                    '/delete',
                    {
                        id: $this.attr('data-id'),
                        title: $this.attr('data-tl')
                    },
                    (data, status) => {
                        if (status == 'success') {
                            $($this.parents('tr')).remove();
                            $('.toast-body').text(data.mess);
                            $('.toast').toast('show');
                        }
                    }
                );
            });
        } else if ($this.hasClass('edit')) {
            $('input[name="name"]').val($this.attr('data-tl'));
            $('input[name="url"]').val($this.attr('data-url'));
            $('input.btn.btn-info').on('click', (event) => {
                const newTitle = $('#editEmployeeModal input[name="name"]').val()
                $.post(
                    '/edit',
                    {
                        id: $this.attr('data-id'),
                        title: $this.attr('data-tl'),
                        newTitle: newTitle
                    },
                    (data, status) => {
                        // const oldName = $this.parents('tr td.name')
                        if (status == 'success') {
                            $('.toast-body').text(data.mess);
                            $('.toast').toast('show');
                        }
                    }
                )
            })
        }
    });

    $('#addEmployeeModal input.btn.btn-success').on('click', () => {
        var url = $('#addEmployeeModal input[name="url"]').val();
        if (url) {
            $.post(
                '/add',
                {
                    url: url
                },
                (data, status) => {
                    if (status == 'success') {
                        $('tbody').append(data.html);
                        $('.toast-body').text(data.mess);
                        $('.toast').toast('show');
                    } else {
                        $('.toast-body').text(data.mess);
                        $('.toast').toast('show');
                    }
                }
            );
        } else {
            $('.toast-body').text('Url không được để trống!');
            $('.toast').toast('show');
        }
    });
});
