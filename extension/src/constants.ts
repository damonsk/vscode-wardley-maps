// Constants extracted from wmlandscape to avoid Next.js dependencies in VS Code extension environment

export const Defaults = {
	ExampleMap: `title Tea Shop
anchor Business [0.95, 0.63]
anchor Public [0.95, 0.78]
component Cup of Tea [0.79, 0.61] label [-85.48, 3.78]
component Cup [0.73, 0.78]
component Tea [0.63, 0.81]
component Hot Water [0.52, 0.80]
component Water [0.38, 0.82]
component Kettle [0.43, 0.35]
evolve Kettle 0.62
component Power [0.1, 0.7]
component Cookies [0.27, 0.61]
component Biscuits [0.27, 0.7]
component Milk [0.33, 0.77]
component Sugar [0.37, 0.77]

Hot Water->Water
Hot Water->Kettle  
Cup of Tea->Cup
Cup of Tea->Tea
Cup of Tea->Hot Water
Business->Cup of Tea
Public->Cup of Tea
Cup of Tea->Cookies
Cup of Tea->Biscuits
Tea->Sugar
Tea->Milk
Kettle->Power

style wardley`,

	ApiEndpoint: 'https://api.onlinewardleymaps.com/v1/maps/'
};
