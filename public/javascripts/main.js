$(document).ready(function () {
	// Activate tooltip
	$('.edit, .delete').on('click', (e) => {
		let $this = $(e.currentTarget);
		if ($this.hasClass('delete')) {
			$('input.btn.btn-danger').on('click', () => {
				$.post('/delete', {
					title: $this.attr('data-tl')
				}, (data, status) => {
					if (status == 'success') {
						$($this.parents('tr')).remove()
					}
				})
			})
		} else if ($this.hasClass('edit')) {
			$('input[name="name"]').val($this.attr('data-tl'))
			$('input[name="url"]').val($this.attr('data-url'))
			$('input[name="time"]').val($this.attr('data-time'))
		}
	});

	$('#addEmployeeModal input.btn.btn-success').on('click', () => {
		var url = $('#addEmployeeModal input[name="url"]').val()
		var time = $('#addEmployeeModal input[name="time"]').val()
		if (url) {
			$.post('/add', {
				url: url,
				time: time
			}, (data, status) => {
				if (status == 'success') {
					$('tbody').append(data.html);
					$('.toast-body').text(data.mess);
					$('.toast').toast('show');
				} else {
					$('.toast-body').text(data.mess);
					$('.toast').toast('show');
				}
			})
		} else {
			$('.toast-body').text('Url không được để trống!');
			$('.toast').toast('show');
		}
	})

	// Select/Deselect checkboxes
	var checkbox = $('table tbody input[type="checkbox"]');
	$("#selectAll").click(function () {
		if (this.checked) {
			checkbox.each(function () {
				this.checked = true;
			});
		} else {
			checkbox.each(function () {
				this.checked = false;
			});
		}
	});
	checkbox.click(function () {
		if (!this.checked) {
			$("#selectAll").prop("checked", false);
		}
	});
});