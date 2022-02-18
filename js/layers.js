const testColors = [
  "red",
  "orange",
  "green",
  "purple",
  "blue",
  "yellow",
  "cyan",
];

const tempColor = [
  "#E1BAE1",
  "#E197BF",
  "#D676A1",
  "#C35989",
  "#A84075",
  "#862E66",
  "#5C255C",
];

const heat = ["#210c4a", "#8a226a", "#e45a31", "#f9cb35"];
const cool = ["#efeaf4", "#9bb9d9", "#1a7db6", "#023858"];
const short = [
  ["#e3eef9", "#93c3df", "#2f7ebc", "#08306b"],
  ["#FDD3F2", "#CA8EFE", "#8A52E4", "#4922AA"],
  ["#EEF3FD", "#96B1D5", "#49729C", "#0B3859"],
  ["#440154", "#31688e", "#35b779", "#fde725"],
  ["#FFE39F", "#9AC394", "#4A9D6C", "#1D7324"],
  ["#D1E1FF", "#A79CE4", "#7F5DB3", "#5C255C"],
  ["#D1E1FF", "#A9A5EC", "#7571CF", "#1F4B99"],
  ["#E8F8B6", "#8FCDA0", "#47A171", "#1D7324"],
  ["#e0ebeb", "#8fa4b9", "#49627f", "#072745"],
  ["#FFE39F", "#93B9A2", "#4B84A0", "#1F4B99"],
  ["#dfdeed", "#99a5d6", "#5173a7", "#00475e"],
];

const colors = [
  ["#e4f1e1", "#b4d9cc", "#89c0b6", "#63a6a0", "#448c8a", "#287274", "#0d585f"],
  ["#d1eeea", "#a8dbd9", "#85c4c9", "#68abb8", "#4f90a6", "#3b738f", "#2a5674"],
  ["#E1BAE1", "#E197BF", "#D676A1", "#C35989", "#A84075", "#862E66", "#5C255C"],
  ["#fcde9c", "#faa476", "#f0746e", "#e34f6f", "#dc3977", "#b9257a", "#7c1d6f"],
  ["#E8F8B6", "#BAE3AE", "#8FCDA0", "#68B78C", "#47A171", "#2E8A4F", "#1D7324"],
  ["#D1E1FF", "#BCBEF4", "#A79CE4", "#927CCF", "#7F5DB3", "#6D3F8E", "#5C255C"],
  ["#ede5cf", "#e0c2a2", "#d39c83", "#c1766f", "#a65461", "#813753", "#541f3f"],
  ["#ecda9a", "#efc47e", "#f3ad6a", "#f7945d", "#f97b57", "#f66356", "#ee4d5a"],
  ["#CFF3D2", "#9FDAC3", "#78BFB6", "#59A3AC", "#4187A4", "#2F699E", "#1F4B99"],
  ["#FFE39F", "#F5C47C", "#E7A55D", "#D78742", "#C66A2C", "#B24C1A", "#9E2B0E"],
  ["#f1eef6", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#034e7b"],
];

var c = colors[5];

var smallramp = [c[0], c[2], c[4], c[6]];

export default [
  // {
  // label:'total',
  // identifier:'P5_001N'},
  // {
  // label:'institutionalized_population',
  // identifier:'P5_002N'},
  {
    display: 'Adult correctional faciltiies',
    label:'ip_correctional_facilities_adults',
    identifier:'P5_003N'},
  {
    display: 'Juvenile facilities',
    label:'ip_juvenile_facilities',
    identifier:'P5_004N'},
  {
    display: 'Nursing & skilled nursing facilities',  
    label:'ip_nursing_skilled-nursing_facilities',
    identifier:'P5_005N'},
  {
    display: 'Other institutionalized pop.',
    label:'ip_other',
    identifier:'P5_006N'},
  // {
  // label:'noninstitutionalized_population',
  // identifier:'P5_007N'},
  {
    display: 'College & university student housing',
    label:'nip_college_university_student_housing',
    identifier:'P5_008N'},
  {
    display: 'Military quarters',
    label:'nip_military_quarters',
    identifier:'P5_009N'},
  {
    display: 'Other non-institutionalized pop.',
    label:'nip_other',
    identifier:'P5_010N'
  }
];
