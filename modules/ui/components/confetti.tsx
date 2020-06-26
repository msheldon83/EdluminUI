import * as React from "react";
import { useTheme } from "@material-ui/styles";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti, { Props as ConfettiProps } from "react-confetti";

const Circle = (radius: number, ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.fill();
};

const Square = (
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D
) => {
  ctx.fillRect(-width / 2, -height / 2, width, height);
};

const Strip = (
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D
) => {
  ctx.fillRect(-width / 6, -height / 2, width / 3, height);
};

const RedRoverLogo = (ctx: CanvasRenderingContext2D) => {
  /*// #layer1
        ctx.save();
        ctx.transform(1.0, 0.0, 0.0, 1.0, 11.9907, 2.68766);

        // #path6
        ctx.save();*/
  ctx.beginPath();
  ctx.transform(0.264583, 0.0, 0.0, 0.264583, -11.9907, -2.68766);
  ctx.fillStyle = "rgb(223, 86, 86)";
  ctx.lineWidth = 0.264583;
  ctx.moveTo(72.441406, 0.0);
  ctx.bezierCurveTo(
    56.991684,
    -0.09266,
    44.334899,
    12.39184,
    44.242188,
    27.851562
  );
  ctx.bezierCurveTo(
    44.149468,
    43.311285,
    56.653793,
    55.956154,
    72.103516,
    56.048828
  );
  ctx.bezierCurveTo(
    87.563237,
    56.141547,
    100.21002,
    43.656987,
    100.30273,
    28.197266
  );
  ctx.bezierCurveTo(100.39545, 12.737543, 87.891127, 0.09266, 72.441406, 0.0);
  ctx.moveTo(72.351566, 14.951172);
  ctx.bezierCurveTo(
    79.561439,
    14.994412,
    85.394804,
    20.899505,
    85.351566,
    28.109375
  );
  ctx.bezierCurveTo(
    85.308326,
    35.319246,
    79.403232,
    41.152613,
    72.193363,
    41.109375
  );
  ctx.bezierCurveTo(
    64.983491,
    41.066135,
    59.150126,
    35.161042,
    59.193363,
    27.951172
  );
  ctx.bezierCurveTo(
    59.236603,
    20.741301,
    65.141694,
    14.90793,
    72.351566,
    14.951172
  );
  ctx.moveTo(0.089844, 64.947266);
  ctx.lineTo(0.0, 79.898438);
  ctx.bezierCurveTo(
    5.339906,
    79.930458,
    10.502974,
    81.080301,
    15.240234,
    83.21875
  );
  ctx.bezierCurveTo(
    18.720875,
    84.789654,
    21.949384,
    86.878688,
    24.84375,
    89.496094
  );
  ctx.lineTo(17.609375, 96.642578);
  ctx.bezierCurveTo(
    17.35788,
    96.891071,
    17.097022,
    97.149646,
    16.855469,
    97.408203
  );
  ctx.bezierCurveTo(
    7.706258,
    107.25351,
    7.873883,
    122.72494,
    17.416016,
    132.40234
  );
  ctx.bezierCurveTo(
    22.167381,
    137.19092,
    28.490599,
    139.85022,
    35.230469,
    139.89062
  );
  ctx.bezierCurveTo(
    41.970351,
    139.93102,
    48.325716,
    137.34879,
    53.154297,
    132.59766
  );
  ctx.bezierCurveTo(
    57.952759,
    127.86636,
    60.621555,
    121.52159,
    60.662109,
    114.76172
  );
  ctx.bezierCurveTo(
    60.700669,
    108.33183,
    58.347303,
    102.22726,
    54.025391,
    97.53125
  );
  ctx.lineTo(54.019491, 97.53715);
  ctx.bezierCurveTo(
    53.809938,
    97.323639,
    53.608674,
    97.101533,
    53.398398,
    96.888713
  );
  ctx.lineTo(46.152304, 89.554729);
  ctx.bezierCurveTo(
    45.539196,
    90.071061,
    44.936944,
    90.626656,
    44.353476,
    91.203166
  );
  ctx.lineTo(35.421835, 100.02934);
  ctx.lineTo(35.400355, 100.02934);
  ctx.lineTo(44.343714, 91.1934);
  ctx.bezierCurveTo(
    44.927182,
    90.616886,
    45.519434,
    90.061239,
    46.142542,
    89.544963
  );
  ctx.bezierCurveTo(
    49.087901,
    86.992584,
    52.340695,
    84.93096,
    55.839808,
    83.421916
  );
  ctx.bezierCurveTo(
    60.562316,
    81.350202,
    65.697873,
    80.302277,
    71.007776,
    80.334025
  );
  ctx.bezierCurveTo(
    76.367683,
    80.366165,
    81.532233,
    81.515889,
    86.269495,
    83.654338
  );
  ctx.bezierCurveTo(
    89.730137,
    85.225121,
    92.967052,
    87.334334,
    95.851526,
    89.931682
  );
  ctx.lineTo(88.619105, 97.080119);
  ctx.bezierCurveTo(
    88.35755,
    97.338556,
    88.104795,
    97.596952,
    87.863245,
    97.85551
  );
  ctx.bezierCurveTo(
    78.714035,
    107.70082,
    78.881658,
    123.15076,
    88.423792,
    132.82816
  );
  ctx.bezierCurveTo(
    93.155156,
    137.61663,
    99.500318,
    140.27604,
    106.24019,
    140.31645
  );
  ctx.bezierCurveTo(
    112.98007,
    140.35685,
    119.33544,
    137.77461,
    124.16402,
    133.02348
  );
  ctx.bezierCurveTo(
    128.96248,
    128.29217,
    131.62937,
    121.94742,
    131.66988,
    115.18754
  );
  ctx.bezierCurveTo(
    131.70848,
    108.75766,
    129.35508,
    102.65307,
    125.03316,
    97.957072
  );
  ctx.lineTo(125.02146, 97.966872);
  ctx.bezierCurveTo(
    124.81053,
    97.752162,
    124.60998,
    97.528647,
    124.39842,
    97.314528
  );
  ctx.lineTo(117.15232, 89.980544);
  ctx.bezierCurveTo(
    116.84577,
    90.23871,
    116.54062,
    90.507575,
    116.24021,
    90.783278
  );
  ctx.bezierCurveTo(
    115.9398,
    91.058981,
    115.64328,
    91.340726,
    115.35154,
    91.628981
  );
  ctx.lineTo(106.4199, 100.45516);
  ctx.lineTo(106.4082, 100.45516);
  ctx.lineTo(115.35156, 91.619216);
  ctx.bezierCurveTo(
    115.64597,
    91.328318,
    115.94213,
    91.062685,
    116.24023,
    90.783278
  );
  ctx.bezierCurveTo(
    116.53292,
    90.508948,
    116.82737,
    90.221884,
    117.11133,
    89.961013
  );
  ctx.bezierCurveTo(
    120.06669,
    87.40869,
    123.329,
    85.347006,
    126.82812,
    83.837966
  );
  ctx.bezierCurveTo(
    131.54063,
    81.766191,
    136.66665,
    80.716374,
    141.97656,
    80.748122
  );
  ctx.lineTo(142.06636, 65.798903);
  ctx.bezierCurveTo(
    132.70653,
    65.742763,
    123.68266,
    68.11976,
    115.77534,
    72.652419
  );
  ctx.bezierCurveTo(
    112.50418,
    74.502834,
    109.42143,
    76.723673,
    106.58589,
    79.306716
  );
  ctx.bezierCurveTo(
    106.55589,
    79.316516,
    106.53429,
    79.337266,
    106.49409,
    79.377026
  );
  ctx.bezierCurveTo(
    103.68962,
    76.780158,
    100.63321,
    74.500859,
    97.394485,
    72.611401
  );
  ctx.bezierCurveTo(
    89.502397,
    67.933986,
    80.497913,
    65.429624,
    71.078079,
    65.37312
  );
  ctx.bezierCurveTo(
    61.718249,
    65.31699,
    52.694391,
    67.693973,
    44.787063,
    72.226635
  );
  ctx.bezierCurveTo(
    41.515909,
    74.077047,
    38.433151,
    76.297894,
    35.59761,
    78.880932
  );
  ctx.bezierCurveTo(
    35.56755,
    78.890732,
    35.54605,
    78.911482,
    35.50581,
    78.951242
  );
  ctx.bezierCurveTo(
    32.701383,
    76.354308,
    29.644977,
    74.075005,
    26.40625,
    72.185547
  );
  ctx.bezierCurveTo(
    18.514161,
    67.508128,
    9.509675,
    65.00377,
    0.089844,
    64.947266
  );
  ctx.moveTo(35.480469, 100.04102);
  ctx.lineTo(35.5, 100.04102);
  ctx.lineTo(42.765625, 107.39453);
  ctx.bezierCurveTo(
    42.964345,
    107.60573,
    43.15401,
    107.80668,
    43.302734,
    108.01758
  );
  ctx.lineTo(43.304734, 108.01558);
  ctx.bezierCurveTo(
    44.889016,
    109.89059,
    45.747138,
    112.21356,
    45.732468,
    114.67184
  );
  ctx.bezierCurveTo(
    45.715848,
    117.44178,
    44.60938,
    120.03635,
    42.67778,
    121.9648
  );
  ctx.bezierCurveTo(
    40.706118,
    123.90301,
    38.109841,
    124.96776,
    35.33989,
    124.95113
  );
  ctx.bezierCurveTo(
    32.569939,
    124.93453,
    29.977324,
    123.82805,
    28.048874,
    121.89644
  );
  ctx.bezierCurveTo(
    24.271793,
    118.06373,
    24.108124,
    112.00193,
    27.492234,
    107.99215
  );
  ctx.bezierCurveTo(
    27.68367,
    107.75329,
    27.915451,
    107.50575,
    28.136765,
    107.28707
  );
  ctx.moveTo(106.48828, 100.4668);
  ctx.lineTo(106.49828, 100.4668);
  ctx.lineTo(113.7639, 107.82031);
  ctx.bezierCurveTo(
    113.95276,
    108.01144,
    114.13229,
    108.21282,
    114.30101,
    108.42383
  );
  ctx.lineTo(114.30901, 108.41583);
  ctx.bezierCurveTo(
    115.8956,
    110.29173,
    116.75534,
    112.63734,
    116.74065,
    115.09747
  );
  ctx.bezierCurveTo(
    116.72405,
    117.86742,
    115.61952,
    120.46198,
    113.68792,
    122.39043
  );
  ctx.bezierCurveTo(
    111.71626,
    124.32864,
    109.11998,
    125.39339,
    106.35003,
    125.37676
  );
  ctx.bezierCurveTo(
    103.58008,
    125.36016,
    100.98551,
    124.25368,
    99.057061,
    122.32208
  );
  ctx.bezierCurveTo(
    95.279978,
    118.48936,
    95.11631,
    112.42755,
    98.50042,
    108.41778
  );
  ctx.bezierCurveTo(
    98.691857,
    108.17892,
    98.923622,
    107.93138,
    99.144951,
    107.7127
  );
  ctx.fill();
  ctx.closePath();
  /*ctx.restore();
          ctx.restore();*/
};

const shapes = [Circle, Square, Strip, RedRoverLogo];

function draw(this: any, ctx: CanvasRenderingContext2D) {
  if (!this.newRan) {
    this.shape = Math.floor(Math.random() * 7);
    this.newRan = true;
  }
  switch (this.shape) {
    case 0:
    case 1:
      Circle(this.radius, ctx);
      break;
    case 2:
    case 3:
      Square(this.w, this.h, ctx);
      break;
    case 4:
    case 5:
      Strip(this.w, this.h, ctx);
      break;
    case 6:
      RedRoverLogo(ctx);
  }
}

type Props = Exclude<ConfettiProps, "drawShape" | "colors">;

export const RedRoverConfetti: React.FC<Props> = ({
  recycle = false,
  ...props
}) => {
  const theme = useTheme();

  return (
    <Confetti
      colors={[
        theme.palette.primary.main,
        theme.customColors.yellow5,
        theme.actions.info,
        theme.customColors.edluminSlate,
        "#FFBAB9",
        "#C4C4C4",
      ]}
      drawShape={draw}
      recycle={recycle}
      {...props}
    />
  );
};
