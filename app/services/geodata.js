FTSS.ng.service('geodata', [

		'utilities',

		function (utilities) {

			"use strict";

			var _self = this;

			/**
			 * @name geodata#index
			 * @type Object
			 */
			this.index = {
				"Altus AFB"                                       : [34.661713, -99.282616],
				"Anacostia NSF"                                   : [38.856586, -77.009483],
				"Andersen AFB"                                    : [144.924444, 13.581111],
				"Andrews AFB"                                     : [38.807583, -76.863625],
				"Antigua Air Station"                             : [17.140181, -61.776990],
				"Arden Hills USARC"                               : [45.081444, -93.147484],
				"Arnold AS"                                       : [35.391975, -86.086014],
				"Atlantic City IAP"                               : [39.451214, -74.572212],
				"Aviano AB"                                       : [46.027536, 12.588408],
				"Badger AAP"                                      : [43.47089, -89.742462],
				"Bangor IAP"                                      : [44.801182, -68.777817],
				"Barin Field"                                     : [30.391052, -87.636047],
				"Barksdale AFB"                                   : [32.497528, -93.591393],
				"Barnes MAP (ANG)"                                : [42.124619, -72.749626],
				"Beale AFB"                                       : [39.113708, -121.361343],
				"Bezmer Air Base"                                 : [42.454722, 26.352222],
				"Birmingham Airport"                              : [33.562111, -86.751076],
				"Boise Air Terminal (ANG)"                        : [43.559746, -116.214882],
				"Bolling AFB"                                     : [38.845581, -77.015701],
				"Bradley IAP"                                     : [41.928688, -72.683876],
				"Bronson Field"                                   : [30.385094, -87.409889],
				"Buckley AFB"                                     : [39.702538, -104.757927],
				"Burlington IAP"                                  : [44.480339, -73.179932],
				"Byrd Field"                                      : [37.52541, -77.315536],
				"Camp Arifjan"                                    : [28.8784, 48.1597],
				"Camp Ashland"                                    : [41.075211, -96.405029],
				"Camp Atterbury"                                  : [39.312698, -86.046318],
				"Camp Bondsteel"                                  : [42.366667, 21.25],
				"Camp Buehring"                                   : [29.701511, 47.43257],
				"Camp Bullis"                                     : [29.690439, -98.568649],
				"Camp Carroll"                                    : [35.866667, 128.6],
				"Camp Casey"                                      : [37.921914, 127.085461],
				"Camp Castle"                                     : [35.907757, 127.766922],
				"Camp Courtney"                                   : [26.383333, 127.85],
				"Camp Darby"                                      : [43.627726, 10.291712],
				"Camp Dodge Johnston TS"                          : [41.673, -93.692848],
				"Camp Doha"                                       : [29.367778, 47.803889],
				"Camp Eagle"                                      : [37.466969, 128.136172],
				"Camp Foster"                                     : [26.283333, 127.783333],
				"Camp Fuji"                                       : [35.316667, 138.933333],
				"Camp Gonsalves"                                  : [26.7, 128.25],
				"Camp Graffton (South)"                           : [47.682495, -98.631477],
				"Camp Grafton (North)"                            : [48.056946, -98.920952],
				"Camp Gruber"                                     : [35.67704, -95.190514],
				"Camp Hansen"                                     : [26.452, 127.918],
				"Camp Hovey"                                      : [37.904989, 127.084044],
				"Camp Humphreys"                                  : [36.966667, 127.033333],
				"Camp Joseph T Robinson"                          : [34.922321, -92.287117],
				"Camp Kinser"                                     : [35.748611, 139.333333],
				"Camp Lemonnier"                                  : [11.544408, 43.1470702],
				"Camp Lester"                                     : [26.316667, 127.766667],
				"Camp Mackall"                                    : [35.036499, -79.497498],
				"Camp Market"                                     : [37.215139, 126.600881],
				"Camp Maxey"                                      : [33.803162, -95.526634],
				"Camp McTureous"                                  : [26.381389, 127.846389],
				"Camp Minden TS"                                  : [32.545151, -93.458801],
				"Camp New York"                                   : [29.439747, 47.465229],
				"Camp Patriot"                                    : [28.867827, 48.277359],
				"Camp Perry (Non-CNIC)"                           : [37.330311, -76.669464],
				"Camp Perry TS (CTC)"                             : [41.549316, -83.021278],
				"Camp Rapid"                                      : [44.073597, -103.271294],
				"Camp Red Cloud"                                  : [37.75, 127.05],
				"Camp Ripley"                                     : [46.184902, -94.440125],
				"Camp Schwab"                                     : [26.383333, 127.85],
				"Camp Smith"                                      : [41.302692, -73.939529],
				"Camp Spearhead"                                  : [29.041763, 48.143635],
				"Camp Stanley"                                    : [37.75, 127.05],
				"Camp Swift"                                      : [30.192024, -97.292862],
				"Camp Virginia"                                   : [29.695658, 47.425747],
				"Camp Zama"                                       : [35.488611, 139.407778],
				"Campion AFS"                                     : [64.733002, -156.932999],
				"Cannon AFB"                                      : [34.382854, -103.322174],
				"Cape Canaveral AFS"                              : [28.467667, -80.566833],
				"Cape Cod AFS"                                    : [41.75185, -70.53978],
				"Cape Lisburne LRRS"                              : [68.870563, -166.150344],
				"Cape Newenham LRRS"                              : [58.639393, -162.061066],
				"Cape Romanzof LRRS"                              : [61.624023, -166.15448],
				"Capital Airport"                                 : [39.83696, -89.674377],
				"Caribbean CSL (Aruba)"                           : [
					12.498650194775227, -70.01192162300111
				],
				"Caribbean CSL (Curacao)"                         : [
					12.188095955054559, -68.96817623550413
				],
				"Carlisle Barracks"                               : [40.20657, -77.177345],
				"Caserma Ederle"                                  : [45.55, 11.54],
				"Cavalier AS"                                     : [48.724663, -97.900673],
				"CBC Gulfport"                                    : [30.371822, -89.125175],
				"Chaklala"                                        : [
					33.613072130602916, 73.09783584159472
				],
				"Charles E. Kelly SPT Facility"                   : [40.44083, -79.995613],
				"Charleston AFB"                                  : [32.888523, -80.040894],
				"Charlotte Douglas IAP"                           : [35.22097, -80.944214],
				"Cheatham Annex"                                  : [37.298775, -76.630325],
				"Chena River Research Site"                       : [64.832588, -147.919922],
				"Clear AFS"                                       : [64.290955, -149.179916],
				"Columbus AFB"                                    : [33.626312, -88.440559],
				"Comalapa CSL"                                    : [
					13.437973242903634, -89.06428850932309
				],
				"Cornhusker AAP"                                  : [40.924129, -98.483498],
				"Creech AFB"                                      : [
					36.59219460813634, -115.66661728837062
				],
				"CTA Camp McCain"                                 : [33.693497, -89.712814],
				"CTC Camp Dawson-Kingwood"                        : [39.459545, -79.656319],
				"CTC Fort Custer Trng Center"                     : [42.29509, -85.328918],
				"Davis-Monthan AFB"                               : [32.151249, -110.809509],
				"Des Moines IAP"                                  : [41.532574, -93.648262],
				"Detroit Arsenal"                                 : [42.498302, -83.036728],
				"Devens Reserve Forces TRN Area"                  : [42.536449, -71.618599],
				"Diego Garcia"                                    : [
					72.41830194136128, -7.313658101654741
				],
				"Dobbins ARB"                                     : [33.91573, -84.510956],
				"Donnelly Training Area"                          : [64.038147, -145.733261],
				"Dover AFB"                                       : [39.13229, -75.486511],
				"Duluth IAP"                                      : [46.838032, -92.202705],
				"Dyess AFB"                                       : [32.417236, -99.846504],
				"Eareckson AS"                                    : [52.712261, 174.113617],
				"Edwards AFB"                                     : [
					34.955886172537085, -117.88070496949769
				],
				"Eglin AFB"                                       : [30.579407, -86.533813],
				"Eielson AFB"                                     : [64.65799, -147.050629],
				"Ellington Field Joint Reserve Base"              : [
					29.607464331986566, -95.16648210818177
				],
				"Ellsworth AFB"                                   : [44.156345, -103.096992],
				"Elmendorf AFB"                                   : [61.259998, -149.792404],
				"Entebbe CSL"                                     : [
					0.046175204521331836, 32.4558804657455
				],
				"Eskan Village Air Base"                          : [24.575851, 46.847506],
				"EWVRA Sheppard Field"                            : [39.401051, -77.984734],
				"F.E. Warren AFB"                                 : [41.153057, -104.860565],
				"Fairchild AFB"                                   : [47.613068, -117.643745],
				"Forbes Field (ANG)"                              : [38.950943, -95.663612],
				"Fort Allen"                                      : [18.004204, -66.497498],
				"Fort AP Hill"                                    : [38.117813, -77.276459],
				"Fort Belvoir"                                    : [38.709709, -77.146988],
				"Fort Benning"                                    : [32.406631, -84.794884],
				"Fort Bliss"                                      : [31.80755, -106.421661],
				"Fort Bragg"                                      : [35.14938, -78.991463],
				"Fort Buchanan"                                   : [18.412317, -66.125443],
				"Fort Buckner"                                    : [26.295714, 127.77709],
				"Fort Campbell"                                   : [36.658592, -87.490112],
				"Fort Carson"                                     : [38.737495, -104.788864],
				"Fort Chaffee MTC"                                : [35.312313, -94.306046],
				"Fort Detrick"                                    : [39.434723, -77.42778],
				"Fort Dix"                                        : [40.002899, -74.619827],
				"Fort Drum"                                       : [44.042332, -75.758163],
				"Fort Eustis"                                     : [37.121452, -76.601318],
				"Fort George G. Meade"                            : [39.108101, -76.741966],
				"Fort Gordon"                                     : [33.357487, -82.235413],
				"Fort Greely"                                     : [63.857616, -146.282959],
				"Fort Hamilton"                                   : [40.608925, -74.030373],
				"Fort Hood"                                       : [
					31.127459307144054, -97.77688712960094
				],
				"Fort Huachuca Wilcox Area"                       : [32.148582, -109.870491],
				"Fort Huachuca"                                   : [31.565298, -110.354713],
				"Fort Hunter Liggett"                             : [35.95739, -121.243576],
				"Fort Indiantown Gap"                             : [40.439812, -76.598297],
				"Fort Jackson"                                    : [34.05201, -80.784889],
				"Fort Knox"                                       : [37.890736, -85.963173],
				"Fort Leavenworth"                                : [39.355, -94.921112],
				"Fort Lee"                                        : [37.233425, -77.330276],
				"Fort Leonard Wood"                               : [37.77058, -92.124702],
				"Fort Lewis"                                      : [47.078541, -122.615662],
				"Fort McClellan ARNG TC"                          : [33.718826, -85.790718],
				"Fort McCoy"                                      : [44.012241, -90.674408],
				"Fort McNair"                                     : [38.866955, -77.017586],
				"Fort Myer"                                       : [38.881546, -77.074928],
				"Fort Pickett ARNG MTC"                           : [37.033276, -77.907379],
				"Fort Polk"                                       : [31.094103, -93.051453],
				"Fort Richardson"                                 : [61.256699, -149.623489],
				"Fort Riley"                                      : [39.093769, -96.806343],
				"Fort Rucker"                                     : [31.343401, -85.715141],
				"Fort Sam Houston"                                : [29.468287, -98.43029],
				"Fort Shafter"                                    : [21.353979, -157.877655],
				"Fort Sill"                                       : [34.652466, -98.370636],
				"Fort Smith MAP"                                  : [35.338593, -94.369209],
				"Fort Stewart"                                    : [31.883533, -81.612968],
				"Fort Story"                                      : [36.924232, -76.011314],
				"Fort Wainwright"                                 : [64.832886, -147.613678],
				"Fort Wolters"                                    : [32.833462, -98.051987],
				"Fort Yukon LRRS"                                 : [66.56472, -145.273895],
				"Francis S Gabreski APT"                          : [40.843655, -72.63179],
				"Fresno Yosemite International Air Terminal (ANG)": [36.775742, -119.718018],
				"Ft Wayne IAP"                                    : [40.986568, -85.187935],
				"George AFB"                                      : [34.581726, -117.366486],
				"Ghedi Air Base"                                  : [
					45.442595445587244, 10.260712123339765
				],
				"Gila Bend Air Force Auxiliary Field"             : [32.887501, -112.720001],
				"Goodfellow AFB"                                  : [31.430395, -100.400017],
				"Graf Ignatievo Air Base"                         : [42.290278, 24.713889],
				"Grand Forks AFB"                                 : [47.962154, -97.383911],
				"Great Falls IAP"                                 : [47.477779, -111.359154],
				"Greater Peoria APT"                              : [40.665928, -89.690483],
				"Green River Test Complex"                        : [38.908401, -110.060349],
				"Greenlief TS/UTES 01"                            : [40.580585, -98.492432],
				"Grissom ARB"                                     : [40.649803, -86.149895],
				"Groom Lake (Area 51)"                            : [
					37.244941634016904, -115.81657023325727
				],
				"Gulfport-Biloxi Reg APT"                         : [30.41338, -89.07296],
				"Haarp Research Station"                          : [61.835415, -148.886719],
				"Hancock Field"                                   : [43.099186, -76.09938],
				"Hanscom AFB"                                     : [42.463028, -71.275627],
				"Harrisburg IAP"                                  : [40.198166, -76.760963],
				"Harvey Point"                                    : [
					36.09958582203599, -76.34920951089329
				],
				"Hector IAP"                                      : [46.918552, -96.825455],
				"Hensley Field"                                   : [32.74601, -96.962883],
				"Hickam AFB"                                      : [21.328075, -157.94838],
				"Hill AFB"                                        : [41.130997, -112.005165],
				"Holloman AFB"                                    : [32.851212, -106.106209],
				"Holston AAP"                                     : [36.545753, -82.644295],
				"Homestead ARB"                                   : [25.494417, -80.390053],
				"Hot Springs"                                     : [34.477386, -93.094025],
				"HQBN HQMC Arlington"                             : [38.873127, -77.067078],
				"Hulburt Field"                                   : [30.430323, -86.686249],
				"Hulman Regional Airport"                         : [39.461212, -87.303581],
				"Hunter Army Airfield"                            : [32.009933, -81.154289],
				"Incirlik Air Base"                               : [37.001944, 35.425833],
				"Indiana AAP"                                     : [38.453751, -85.670197],
				"Iowa Army AAP"                                   : [40.792789, -91.201454],
				"ITC Camp San Luis Obispo"                        : [35.324928, -120.743866],
				"Izmir Air Base"                                  : [38.423508, 27.142853],
				"Jackson IAP Thompson Field"                      : [32.310165, -90.074905],
				"Jacksonville IAP"                                : [30.490101, -81.688843],
				"Jacobabad"                                       : [
					28.295840594360364, 68.44108609774774
				],
				"Jalalabad Airfield"                              : [
					34.397416933806944, 70.50458566374583
				],
				"Joe Foss Field"                                  : [43.595238, -96.73732],
				"Joint Force Command Brunssum"                    : [50.9382499, 5.9808809],
				"Joliet AAP Kankakee"                             : [41.370979, -88.151505],
				"K-16 Air Base"                                   : [37.445833, 127.113889],
				"Kadena Air Base"                                 : [26.355556, 127.7675],
				"Kahuka Trn Area"                                 : [21.655514, -158.007431],
				"Keesler AFB"                                     : [30.410917, -88.924103],
				"Key Field"                                       : [32.332844, -88.745132],
				"Kirtland AFB"                                    : [34.999065, -106.523781],
				"Klamath Falls Airport-Kingsley Field"            : [42.159203, -121.734306],
				"Kleine Brogel Air Base"                          : [
					51.16165383274989, 5.456972837356604
				],
				"Kunsan Air Base"                                 : [35.916667, 126.616667],
				"Lackland AFB"                                    : [29.380978, -98.624954],
				"Lajes Field"                                     : [38.761667, -27.095],
				"Lake City AAP"                                   : [39.0989, -94.242859],
				"Lambert-St Louis IAP"                            : [38.740463, -90.364861],
				"Landstuhl Medical Center"                        : [49.404167, 7.560278],
				"Langley AFB"                                     : [37.092155, -76.367683],
				"Laughlin AFB"                                    : [29.355661, -100.783844],
				"Lincoln MAP"                                     : [40.848808, -96.758347],
				"Little Rock AFB"                                 : [34.9104, -92.146606],
				"Lone Star AAP"                                   : [33.435162, -94.073601],
				"Longhorn AAP"                                    : [32.661343, -94.141144],
				"Los Angeles AFB"                                 : [
					33.918949872262765, -118.38076076190187
				],
				"Louisiana AAP"                                   : [32.550514, -93.433197],
				"Louisville IAP"                                  : [38.185802, -85.742104],
				"Luis Munoz Marin IAP"                            : [18.439878, -65.996246],
				"Luke AFB"                                        : [33.542297, -112.373177],
				"MacDill AFB"                                     : [27.843933, -82.500458],
				"Makua Military Reserve"                          : [21.529577, -158.203461],
				"Malmstrom AFB"                                   : [47.509384, -111.190689],
				"Mansfield Lahm MAP"                              : [40.819397, -82.51265],
				"MARBKS Washington"                               : [38.880409, -76.994675],
				"March ARB"                                       : [33.880711, -117.259453],
				"Marseilles (MTA TNG AREA)"                       : [41.330868, -88.70813],
				"Martin ANGS"                                     : [39.326462, -76.415749],
				"Maxwell AFB"                                     : [32.381542, -86.366112],
				"MCAGCC Twentynine Palms"                         : [
					34.2999914221971, -116.16688703671836
				],
				"McAlester AAP"                                   : [34.820568, -95.938622],
				"MCAS Beaufort"                                   : [32.473854, -80.702133],
				"MCAS Cherry Point"                               : [34.900833, -76.880836],
				"MCAS Futenma"                                    : [26.283333, 127.783333],
				"MCAS Iwakuni"                                    : [34.143611, 132.235556],
				"MCAS Miramar"                                    : [32.867764, -117.073662],
				"MCAS Yuma"                                       : [32.655033, -114.604073],
				"MCB Camp Lejeune"                                : [34.625053, -77.401337],
				"MCB Camp Pendleton"                              : [33.335117, -117.419128],
				"MCB Hawaii Kanohe"                               : [21.448915, -157.767105],
				"MCB Quantico"                                    : [38.514862, -77.303238],
				"McChord AFB"                                     : [47.133221, -122.481079],
				"McConnell AFB"                                   : [37.63092, -97.258934],
				"McEntire Joint NGB"                              : [33.922852, -80.80101],
				"McGhee Tyson APT"                                : [35.804447, -83.987732],
				"McGuire AFB"                                     : [40.033924, -74.58773],
				"MCLB Albany"                                     : [31.550745, -84.05674],
				"MCLB Barstow"                                    : [34.855122, -116.957306],
				"MCRD Parris Island"                              : [32.330658, -80.69252],
				"MCRD San Diego"                                  : [32.736172, -117.197342],
				"MCSF Blount Island"                              : [30.408117, -81.536407],
				"MCSPTACT Kansas City"                            : [38.811131, -94.531326],
				"Memphis IAP"                                     : [35.044701, -89.981659],
				"Meridian NAS"                                    : [32.556934, -88.559662],
				"Milan AAP"                                       : [35.886318, -88.691635],
				"Military Ocean TML Sunny Point"                  : [34.005997, -77.978897],
				"Minneapolis-St Paul IAP-ARS"                     : [44.881233, -93.20311],
				"Minot AFB"                                       : [48.419891, -101.336342],
				"Misawa Air Base"                                 : [40.703056, 141.368333],
				"Mississippi AAP"                                 : [30.383156, -89.592575],
				"Montgomery ANGS"                                 : [32.305256, -86.390907],
				"Moody AFB"                                       : [30.968485, -83.192207],
				"Moron Air Base"                                  : [37.174722, -5.615833],
				"Mountain Home AFB"                               : [43.049618, -115.865524],
				"MTA Camp Crowder Neosho"                         : [36.82061, -94.363907],
				"MTA Camp Edwards"                                : [
					34.95694946595611, -117.88050112161255
				],
				"MTA Camp Rilea"                                  : [46.115105, -123.94014],
				"MTA Camp Santiago Rq577"                         : [18.02216, -66.276054],
				"MTA Camp Shelby"                                 : [31.180014, -89.199158],
				"MTA Fort Wm Henry Harrison"                      : [46.621056, -112.097488],
				"MTA-L Camp Williams"                             : [40.431892, -111.930771],
				"MTC Camp Blanding"                               : [29.92444, -81.982903],
				"MTC-H Camp Grayling"                             : [44.679394, -84.726219],
				"MTC-H Camp Roberts"                              : [35.783283, -120.779572],
				"MTCH Guernsey"                                   : [42.260113, -104.728622],
				"MWTC Bridgeport"                                 : [38.263241, -119.094353],
				"Myrtle Beach AFB"                                : [33.669167, -78.944298],
				"NAF El Centro"                                   : [32.825943, -115.671616],
				"NAF Washngton"                                   : [38.80761, -76.857605],
				"NAS and JRB Fort Worth"                          : [32.769165, -97.441528],
				"NAS Brunswick NCTS Cutler VLF Area"              : [44.676468, -67.236328],
				"NAS Brunswick"                                   : [43.87513, -69.934845],
				"NAS Corpus Christi"                              : [27.692345, -97.277756],
				"NAS Fallon"                                      : [39.423637, -118.703423],
				"NAS Jacksonville"                                : [30.208641, -81.690903],
				"NAS JRB New Orleans"                             : [29.82789, -90.022232],
				"NAS JRB Willow Grove"                            : [40.205811, -75.14006],
				"NAS Key West"                                    : [24.571636, -81.697945],
				"NAS Kingsville"                                  : [27.502707, -97.811348],
				"NAS Lemoore"                                     : [36.289742, -119.950417],
				"NAS Moffett Field"                               : [37.414619, -122.049179],
				"NAS North Island Imperial Beach"                 : [32.559692, -117.111168],
				"NAS North Island"                                : [32.69949, -117.208672],
				"NAS Oceana Dam Neck"                             : [36.78083, -75.959816],
				"NAS Oceana"                                      : [36.816708, -76.027107],
				"NAS Patuxent River"                              : [38.275009, -76.412346],
				"NAS Pensacola"                                   : [30.354509, -87.31041],
				"NAS Sigonella"                                   : [37.401667, 14.922222],
				"NAS Whidbey Island"                              : [48.343929, -122.659607],
				"NAS Whiting Field Milton"                        : [30.705534, -87.015839],
				"Nashville IAP"                                   : [36.134773, -86.668045],
				"NATO Base Geilenkirchen"                         : [50.960833, 6.0425],
				"NAVACT Puerto Rico"                              : [18.23457, -65.646057],
				"Naval Air Facility Atsugi"                       : [35.454722, 139.450278],
				"Naval Base Guam"                                 : [13.44, 144.66],
				"Naval Communication Station Holt"                : [
					114.16562332711099, -21.81628577140847
				],
				"Naval Forces Marianas"                           : [13.581111, 144.924444],
				"Naval Medical Research Unit"                     : [
					30.063218213724003, 31.29450467065908
				],
				"Naval Outlying Field San Nicholas Island"        : [
					31.833151698450237, 36.78567098678583
				],
				"Naval Research Lab"                              : [38.824566, -77.022224],
				"Naval Station Pearl Harbor"                      : [21.352381, -157.955078],
				"Naval Station Rota"                              : [36.616667, -6.35],
				"Naval Surface Warfare Center Corona Division"    : [
					31.833151698450237, 36.78567098678583
				],
				"Naval Weapons Systems Training Facility Boardman": [45.669724, -119.687805],
				"NAVBASE Guam"                                    : [13.428693, 144.652176],
				"NAVBASE Kitsap Bremerton"                        : [47.56031, -122.647247],
				"NAVBASE Ventura City Point Mugu"                 : [34.118626, -119.119949],
				"NAVMAG Indian Island"                            : [48.055252, -122.72673],
				"NAVMEDCEN Bethesda"                              : [39.002045, -77.093552],
				"NAVMEDCEN Portsmouth"                            : [36.84597, -76.307518],
				"NAVMEDCEN San Diego"                             : [32.727436, -117.145241],
				"NAVPHIBASE Little Creek"                         : [36.914764, -76.160828],
				"NAVSUBASE Kings Bay"                             : [30.790073, -81.537956],
				"NAVSUBASE New London CT"                         : [41.35001, -72.078445],
				"NAVSUBASE San Diego"                             : [32.695732, -117.247124],
				"NAVSUPPDET Monterey"                             : [36.584106, -121.876488],
				"NAWCADLKE Non-NIF Lakehurst NJ"                  : [40.014797, -74.311539],
				"NAWS China Lake"                                 : [
					35.688763063179266, -117.68452264124754
				],
				"Nellis AFB"                                      : [
					36.22574185271774, -115.03605609526858
				],
				"New Castle County APT"                           : [39.675667, -75.618294],
				"NG Biak Trn Center"                              : [44.230705, -121.028015],
				"NG Camp Fogarty TS"                              : [41.6604, -71.456009],
				"NG Camp Navajo"                                  : [35.197376, -111.846313],
				"NG Florence Military Reservation"                : [33.116421, -111.358627],
				"NG Gowen Field Boise"                            : [43.221191, -115.945587],
				"Niagara Falls IAP ARS"                           : [43.099358, -78.946701],
				"Niamey"                                          : [
					13.48758893638576, 2.1655852056574076
				],
				"NOFL Site 8"                                     : [30.542978, -87.367935],
				"NOIC Sugar Grove"                                : [38.51123, -79.321709],
				"NOLF Brewton"                                    : [31.051144, -87.065849],
				"NOLF Chactaw"                                    : [30.507851, -86.95507],
				"NOLF Evergreen"                                  : [31.432781, -86.9561],
				"NOLF Holley"                                     : [30.42588, -86.889839],
				"NOLF Santa Rosa"                                 : [30.610142, -86.943398],
				"NOLF Silverhill"                                 : [30.563038, -87.810104],
				"NOLF Spencer"                                    : [30.630342, -87.146217],
				"NOLF Summerdale"                                 : [30.487499, -87.701111],
				"NOLF Wolf"                                       : [30.344065, -87.541512],
				"North Air Force Auxiliary Field"                 : [33.609318, -81.071014],
				"NRTF Grindavik"                                  : [
					63.85035752960193, -22.46650516418458
				],
				"NS Everett"                                      : [47.989693, -122.221184],
				"NS Great Lakes"                                  : [42.309174, -87.850143],
				"NS Ingleside"                                    : [27.831472, -97.202736],
				"NS Mayport"                                      : [30.389757, -81.401482],
				"NS Newport"                                      : [41.516804, -71.319984],
				"NS Norfolk"                                      : [36.935623, -76.288551],
				"NS Pascagoula"                                   : [30.336706, -88.576874],
				"NS San Diego"                                    : [32.676952, -117.118378],
				"NSA Annapolis"                                   : [38.983097, -76.488174],
				"NSA Athens"                                      : [33.961109, -83.377983],
				"NSA Crane"                                       : [38.89077, -86.902153],
				"NSA Gaeta"                                       : [41.216667, 13.566667],
				"NSA La Maddalena"                                : [41.216667, 9.4],
				"NSA Mechanicsburg"                               : [40.390697, -77.070763],
				"NSA Midsouth Millington Memphis"                 : [35.337463, -89.876961],
				"NSA Naples"                                      : [40.8807622, 14.2905454],
				"NSA New Orleans"                                 : [29.959599, -90.077049],
				"NSA Norfolk NSY"                                 : [36.812309, -76.299194],
				"NSA Norfolk St. Juliens Creek Annex"             : [36.794167, -76.312225],
				"NSA Norfolk"                                     : [36.919292, -76.314636],
				"NSA Orlando"                                     : [28.790529, -81.896553],
				"NSA Panama City"                                 : [30.182528, -85.756531],
				"NSA South Potomac"                               : [38.326271, -77.024162],
				"NSA Washington"                                  : [38.873997, -76.995361],
				"NSF Carderock"                                   : [38.977612, -77.194427],
				"NSF Indian Head"                                 : [38.574474, -77.184875],
				"NSU Saratoga Springs"                            : [43.07991, -73.820366],
				"NSY Portsmouth"                                  : [43.100983, -70.718994],
				"NTC and Fort Irwin"                              : [
					35.27080211424935, -116.6357567833038
				],
				"NWS Charleston"                                  : [32.942997, -79.960213],
				"NWS Earle"                                       : [40.254276, -74.169029],
				"NWS Seal Beach"                                  : [33.748894, -118.068695],
				"NWS Yorktown"                                    : [37.244678, -76.585526],
				"Offutt AFB"                                      : [41.124271, -95.914558],
				"OLF Coupeville"                                  : [48.193787, -122.633171],
				"OLF Whitehouse"                                  : [30.360434, -81.87973],
				"Oliktok LRRS"                                    : [70.498093, -149.887848],
				"Onizuka AFB"                                     : [37.414539, -122.02652],
				"Osan Air Base"                                   : [37.090556, 127.029722],
				"Otis ANGB"                                       : [41.658333, -70.521385],
				"Panzer Kaserne"                                  : [48.681944, 9.046111],
				"Patrick AFB"                                     : [28.245724, -80.608063],
				"Patrick Henry Village"                           : [49.378, 8.629],
				"Pease ANGB"                                      : [43.080925, -70.768433],
				"Pentagon"                                        : [38.871822, -77.054848],
				"Peterson AFB"                                    : [38.825012, -104.701195],
				"Picatinny Arsenal"                               : [40.94796, -74.552185],
				"Pine Bluff Arsenal"                              : [34.326626, -92.09465],
				"Pine Gap"                                        : [
					133.73681069558708, -23.798707832429475
				],
				"Pinon Canyon"                                    : [37.490471, -104.144081],
				"Pittsburgh IAP ARS"                              : [40.495998, -80.256691],
				"Pohakuloa Training Area"                         : [19.76, -155.553604],
				"Point Lay LRRS"                                  : [69.735954, -162.981491],
				"Pope AFB"                                        : [35.168655, -79.010559],
				"Portland IAP"                                    : [45.589611, -122.592117],
				"Presidio of Monterey"                            : [36.602715, -121.913055],
				"Quonset State APT"                               : [41.595421, -71.416801],
				"Radford AAP"                                     : [37.124336, -80.556328],
				"RAF Alconbury"                                   : [52.370908, -0.226928],
				"RAF Croughton"                                   : [51.99729, -1.20906],
				"RAF Fairford"                                    : [51.682222, -1.79],
				"RAF Lakenheath"                                  : [52.408333, 0.556667],
				"RAF Menwith Hill"                                : [54.008056, -1.69],
				"RAF Mildenhall"                                  : [52.365, 0.480833],
				"Ramstein Air Base"                               : [49.438333, 7.601944],
				"Randolph AFB"                                    : [29.530451, -98.280258],
				"Ravenna TRN and Logistics Site"                  : [41.203022, -81.038528],
				"Redstone Arsenal"                                : [34.684074, -86.654037],
				"Reno-Tahoe IAP"                                  : [39.499111, -119.768112],
				"Rickenbacker IAP (ANG)"                          : [39.811966, -82.938194],
				"Riyadh Air Base"                                 : [24.709722, 46.725278],
				"Robins AFB"                                      : [32.629833, -83.586906],
				"Rock Island Arsenal"                             : [41.518032, -90.536957],
				"Rocky Mountain Arsenal"                          : [39.828259, -104.858742],
				"Rome Laboratory"                                 : [43.244953, -75.504051],
				"Rosecrans MAP"                                   : [39.772354, -94.906944],
				"Salt Lake City IAP"                              : [40.785595, -111.980675],
				"San Clemtente"                                   : [32.909569, -118.498535],
				"Saufley Field"                                   : [30.471165, -87.341827],
				"Schenectady MAP (ANG)"                           : [42.814243, -73.939568],
				"Schofield Barracks Mil Reservation"              : [21.503635, -158.10141],
				"Schriever AFB"                                   : [38.836376, -104.550232],
				"Scott AFB"                                       : [38.54425, -89.850449],
				"Scranton AAP"                                    : [41.39904, -75.67086],
				"Selfridge ANGB"                                  : [42.613243, -82.833649],
				"Seychelles"                                      : [
					55.50882899328463, -4.669361301198663
				],
				"Seymour Johnson AFB"                             : [35.339455, -77.960121],
				"Shaw AFB"                                        : [33.972832, -80.468803],
				"Sheppard AFB"                                    : [33.972599, -98.503647],
				"Sioux Gateway APT"                               : [42.398361, -96.385803],
				"Soto Cano (JTF Bravo)"                           : [
					14.375383713530761, -87.61640931947404
				],
				"Spangdahlem Air Base"                            : [49.978384, 6.700287],
				"Sparrevohn LRRS"                                 : [61.197536, -155.343933],
				"Spokane IAP (AGS)"                               : [47.621323, -117.535683],
				"Springfield-Beckley MAP"                         : [39.839252, -83.84388],
				"Stewart IAP"                                     : [41.497421, -74.101326],
				"Stone Ranch Mil Res"                             : [41.367207, -72.272644],
				"Sunflower AAP"                                   : [38.913219, -95.015198],
				"Tatlina LRRS"                                    : [62.983307, -155.691376],
				"Ted Stevens IAP"                                 : [61.173916, -149.981018],
				"Thule Air Base"                                  : [76.531389, -68.703333],
				"Tinker AFB"                                      : [35.419945, -97.387817],
				"Toledo Express APT"                              : [41.587971, -83.805946],
				"Torii Station"                                   : [26.493, 127.851],
				"Transit Center at Manas"                         : [43.050278, 74.469444],
				"Travis AFB"                                      : [38.265671, -121.945587],
				"Tripler Army Medical Center"                     : [21.364531, -157.892426],
				"Truax ANGB"                                      : [43.134533, -89.334686],
				"Tucson IAP"                                      : [32.121037, -110.937363],
				"Tulsa IAP"                                       : [36.189266, -95.889038],
				"Tyndall AFB"                                     : [30.072371, -85.597282],
				"US Army Joint SYS MFG CTR Lima"                  : [40.708618, -84.129333],
				"USA Adelphi Laboratory CTR"                      : [39.002789, -76.968979],
				"USAF Academy"                                    : [38.990269, -104.858315],
				"USAG Ansbach"                                    : [49.300884, 10.573165],
				"USAG Bamberg"                                    : [49.905998, 10.912336],
				"USAG Baumholder"                                 : [49.615158, 7.34069],
				"USAG Benelux"                                    : [50.575833, 3.831],
				"USAG Brussels"                                   : [50.864248, 4.434571],
				"USAG Daegu"                                      : [35.8382377, 128.5906363],
				"USAG Darmstadt"                                  : [49.844486, 8.650359],
				"USAG Garmisch"                                   : [47.492343, 11.086231],
				"USAG Grafenwoehr"                                : [49.721373, 11.902607],
				"USAG Heidelberg"                                 : [49.401736, 8.675071],
				"USAG Hessen"                                     : [50.119093, 8.960008],
				"USAG Hohenfels"                                  : [52.584563, 10.753928],
				"USAG Kaiserslautern"                             : [49.423683, 7.737672],
				"USAG Mannheim"                                   : [49.401929, 8.680239],
				"USAG Schinnen"                                   : [50.95, 5.883333],
				"USAG Schweinfurt"                                : [50.049113, 10.231144],
				"USAG Stuttgart"                                  : [48.777127, 9.180707],
				"USAG Wiesbaden"                                  : [50.075767, 8.268761],
				"USAG Yongsan"                                    : [35.907757, 127.766922],
				"Vance AFB"                                       : [36.339165, -97.916496],
				"Vandenberg AFB"                                  : [
					34.73239301018508, -120.56887547783202
				],
				"Volk Field ANGB"                                 : [43.922466, -90.271523],
				"Volkel Air Base"                                 : [
					51.659233829609434, 5.684751570224762
				],
				"Volunteer AAP"                                   : [35.045738, -85.309608],
				"VTS Catoosa"                                     : [34.84063, -85.042931],
				"W.H. Ford Regional Training Center"              : [37.256855, -87.201324],
				"Wainwright SRRS"                                 : [70.609444, -159.866669],
				"Wake Island Airfield"                            : [
					19.282743935813667, 166.64913293519587
				],
				"Watervliet Arsenal"                              : [42.720249, -73.706856],
				"Webster Field OLF"                               : [38.143333, -76.428711],
				"West Point Mil Res"                              : [41.364441, -74.031715],
				"Westover ARB"                                    : [42.194012, -72.534782],
				"Wheeler Army Airfield"                           : [21.476393, -158.036957],
				"Whiteman AFB"                                    : [38.732746, -93.554642],
				"Will Rogers World APT"                           : [35.393616, -97.597328],
				"Willow Grove JRB"                                : [40.206738, -75.154724],
				"WK Kellogg APT"                                  : [42.308167, -85.25116],
				"Wright-Patterson AFB"                            : [39.813728, -84.053741],
				"Yakima Training Center"                          : [46.675434, -120.461876],
				"Yeager APT"                                      : [38.372177, -81.59211],
				"Yokota Air Base"                                 : [35.748611, 139.348611],
				"Yontan Airfield"                                 : [26.393564, 127.7467],
				"Youngstown ARS"                                  : [41.25742, -80.679474]
			};

			/**
			 * name geodata#map
			 * @type {Array}
			 */
			this.map = _.map(_self.index, function (row, key) {

				return {

					'Id'    : key,
					'label' : key,
					'coord' : row,
					'search': key

				}

			});

			/**
			 * Calculate distance between two coordinates
			 *
			 * @name geodata#distanceCalc
			 * @param start
			 * @param end
			 * @returns {number}
			 */
			this.distanceCalc = function (start, end) {

				if (start && end) {

					start = JSON.parse('[' + start + ']');
					end = JSON.parse('[' + end + ']');

					var deg2rad = function (deg) {
						return deg * (Math.PI / 180);
					};

					var R = 3963.1676; // Radius of the earth in miles
					var dLat = deg2rad(end[0] - start[0]);  // deg2rad below
					var dLon = deg2rad(end[1] - start[1]);
					var a = Math.sin(dLat / 2) *
					        Math.sin(dLat / 2) +
					        Math.cos(deg2rad(start[0])) *
					        Math.cos(deg2rad(end[0])) *
					        Math.sin(dLon / 2) *
					        Math.sin(dLon / 2);
					var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

					return Math.ceil(R * c); // Distance in miles

				}
			};

			/**
			 * @name geodata#distances
			 * @param row
			 * @param start
			 * @param end
			 */
			this.distances = function (row, start, end) {

				// attemp  Cartesian calculation for a distance estimate
				var d = _self.distanceCalc(start, end) || 'unknown';

				// If the results aren't valid, just set distanceInt to past the Sun--yes, overkill?
				row.distanceInt = parseInt(d, 10) || 99999999;

				// we can't just use toLocale() thanks to our favorite browser (IE)...grrrr
				row.distance = utilities.prettyNumber(d) + ' miles'

			}


		}

	]
);