$(function() {
	// Add chart styling/events
	if ($('.poll-chart').get(0)) {
		var chartColors = ['#FF6384', '#36A2EB', '#FFCE56', '#31CA64', '#A964CA'];

		$('.poll-chart').each(function(i, e) {
			var $chart = $(e);

			$.getJSON('/polls/' + $chart.data('id') + '/votes')
				.done(function(votes) {
					// Create Chart
					var myPieChart = new Chart($chart[0].getContext('2d'), {
						type: 'pie',
						data: data = {
							labels: votes.map(function(vote) { return vote.term; }),
							datasets: [{
								data: votes.map(function(vote) { return vote.count; }),
								backgroundColor: chartColors,
								hoverBackgroundColor: chartColors
							}]
						}
					});
					$chart.text(votes);
				})
				.fail(function() {
					$chart.text('Unable to load chart');
				});
		});
	}

	// Add dynamic terms to new poll form
	$('.new-term').click(function(e) {
		e.preventDefault();
		$('.term-set').append($term.clone(true));
	});
	$('.del-term').click(function(e) {
		$(this).closest('.form-group').remove();
	});
	var $term = $('.term-set .form-group').clone(true);
});
