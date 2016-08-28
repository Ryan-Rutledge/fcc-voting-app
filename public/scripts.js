$(function() {
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
							datasets: [
								{
									data: votes.map(function(vote) { return vote.count; }),
									backgroundColor: chartColors,
									hoverBackgroundColor: chartColors
								}]
						}
					});
					console.log(votes);
					$chart.text(votes);
				})
				.fail(function() {
					$chart.text('Unable to load chart');
				});
		});
	}
});
