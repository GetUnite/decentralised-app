import { grommet } from 'grommet';
import { deepMerge } from 'grommet/utils';
export enum colors {
  WHITE = '#FFFFFF',
  WHITE_10 = 'rgba(255,255,255,.1)',
  LIGHT_GREY = '#FAFAFA',
  BLACK = '#000000',
  BLACK_70 = '#4C4C4C',
  BLACK_50 = '#808080',
  BLACK_40 = '#999999',
  BLACK_30 = '#B3B3B3',
  BLACK_20 = '#CCCCCC',
  BLACK_8 = '#EBEBEB',
  BLACK_5 = '#F2F2F2',
  BLACK_3 = '#F6F6F6',
  BLUE = '#2A73FF',
  BLUE_80 = '#282A2E',
  BLUE_40 = 'rgba(42, 115, 255, 0.4)',
  BLUE_30 = 'rgba(42, 115, 255, 0.3)',
  BLUE_10 = 'rgba(42, 115, 255, 0.1)',
  BLUE_5 = 'rgba(42, 115, 255, 0.05)',
  SECOND_BLUE = '#C9CFEA',
  LIGHT_BLUE = 'rgba(42, 115, 255, 0.1)',
  RED = '#FB5F3D',
  ERROR = '#FF0000',
  ERROR_10 = 'rgba(255, 0, 0, 0.1)',
  GREEN = '#12C902',
  DOP_BLUEGREEN = 'rgba(115, 205, 222, 0.7)',
  DOP_BROWN = 'rgba(148, 163, 173, 0.6)',
  DOP_FUXIA = 'rgba(175, 108, 195, 0.6)',
  DOP_BLUE = 'rgba(119, 179, 240, 0.7)',
  DOP_LIGHTGREEN = 'rgba(214, 225, 109, 0.9)',
  DOP_ORANGE = 'rgba(241, 160, 60, 0.7)',
  DOP_LIGHTFUXIA = 'rgba(220, 129, 226, 0.7)',
  DOP_RED = 'rgba(235, 94, 88, 0.6)',
  PURPLE = '#8247E5',
}

export const isSmall = size =>
  size === 'xsmall' || size === 'small' || size === 'xmedium';

export const theme = deepMerge(grommet, {
  global: {
    focus: { outline: { color: 'primary' } },

    breakpoints: {
      xsmall: {
        value: 500,
      },
      xmedium: {
        value: 980,
      },
    },
    font: {
      family: 'Poppins',
      size: '18px',
      height: '27px',
    },
    colors: {
      primary: { light: colors.BLUE, dark: colors.WHITE },
      primaryText: { light: colors.BLUE, dark: colors.WHITE },
      primaryStatic: colors.BLUE,
      error: colors.ERROR,
      errorSoft: 'rgb(250,243,243)',
      darkErrorSoft:
        'linear-gradient(90.03deg, rgba(57, 2, 13, 0.95) 6.3%, rgba(32, 32, 32, 0.95) 95.91%);',
      info: colors.BLUE,
      infoSoft: 'rgb(229,237,251)',
      darkInfoSoft:
        'linear-gradient(90.08deg, rgba(23, 46, 91, 0.95) -1.24%, rgba(32, 32, 32, 0.95) 70.29%);',
      border: { light: colors.BLACK_20 },
      // brand: { light: 'rgba(255,255,255,.2)', dark: 'red' },
      brand: { light: colors.BLUE, dark: 'white' },
      buttonMax: { light: colors.LIGHT_GREY, dark: '#151922' },
      modal: { light: '#FFFFFF', dark: '#1D1D1D' },
      // whiteBlack:
      text: { light: colors.BLACK, dark: colors.WHITE },
      softText: '#CCCCCC',
      successSoft: 'rgb(238,248,238)',
      darkSuccessSoft:
        'linear-gradient(90.03deg, rgba(10, 50, 16, 0.9) 6.3%, rgba(32, 33, 32, 0.9) 95.91%);',
      success: colors.GREEN,
      soul: colors.BLACK_40,
      casper: { light: colors.BLACK_8, dark: colors.WHITE_10 },
      // active: 'red', hover color
      bg: { light: colors.WHITE, dark: colors.BLACK },
      badge: colors.PURPLE,
      tab: { light: colors.BLACK_5, dark: colors.BLACK },
      tabSelected: { light: 'bg', dark: colors.BLUE_30 },
      tabSelectedBorder: { light: 'transparent', dark: colors.BLUE },
      tabText: { light: colors.BLACK_50, dark: colors.WHITE },
      card: { light: '#FFFFFF', dark: 'rgba(29, 29, 29, 0.8)' },
      softButton: { light: colors.BLACK_3, dark: colors.WHITE },
      tabSwitch: { light: colors.BLACK_3, dark: colors.BLACK },
      container: {
        light:
          'linear-gradient(360deg, rgba(250, 252, 255, 0.36) 0%, #FAFAFA 104.31%);',
        dark: 'linear-gradient(40deg, #0B1D41 0%, #000 30%);',
      },
    },
    edgeSize: {
      none: '0px',
      hair: '2px',
      xxsmall: '4px',
      xsmall: '8px',
      small: '12px',
      medium: '24px',
      large: '48px',
      xlarge: '96px',
      responsiveBreakpoint: 'small',
    },
    size: { medium: '450px' },
    drop: {
      background: 'white',
    },
    input: { padding: '16px', weight: 'normal' },
    control: { extend: `color: text;`, border: { radius: '8px' } },
  },
  text: {
    xxsmall: { size: '8px' },
    xsmall: { size: '10px' },
    small: { size: '12px' },
    medium: { size: '14px' },
    large: { size: '16px' },
    xlarge: { size: '18px', height: '18px' },
  },
  icon: {
    size: {
      small: '10px',
      medium: '14px',
      large: '24px',
      xlarge: '48px',
    },
  },
  heading: {
    level: {
      1: {
        small: {
          size: '24px',
          height: '40px',
          maxWidth: '816px',
        },
        medium: {
          size: '48px',
          height: '72px',
          maxWidth: '1200px',
        },
        large: {
          size: '82px',
          height: '88px',
          maxWidth: '1968px',
        },
        xlarge: {
          size: '114px',
          height: '120px',
          maxWidth: '2736px',
        },
      },
      2: {
        font: {},
        small: {
          size: '26px',
          height: '32px',
          maxWidth: '624px',
        },
        medium: {
          size: '34px',
          height: '40px',
          maxWidth: '816px',
        },
        large: {
          size: '50px',
          height: '56px',
          maxWidth: '1200px',
        },
        xlarge: {
          size: '66px',
          height: '72px',
          maxWidth: '1584px',
        },
      },
      3: {
        font: {},
        small: {
          size: '22px',
          height: '28px',
          maxWidth: '528px',
        },
        medium: {
          size: '26px',
          height: '32px',
          maxWidth: '624px',
        },
        large: {
          size: '34px',
          height: '40px',
          maxWidth: '816px',
        },
        xlarge: {
          size: '42px',
          height: '48px',
          maxWidth: '1008px',
        },
      },
    },
  },
  button: {
    extend: `
    color: primary;
    font-weight: 500
    `,
    hover: {
      secondary: {
        border: { color: 'text' },
      },
    },
    padding: {
      vertical: '0px',
    },
    border: {
      width: '1px',
      radius: '8px',
      color: 'primary',
    },
    default: {
      color: 'primaryText',
      border: { color: 'primaryText', width: 1 },
    },
    size: {
      medium: {
        pad: { vertical: '11px' },
      },
      small: {
        pad: { vertical: '6px' },
        border: { radius: '18px' },
      },
    },

    primary: {
      color: '#FFFFFF',
      background: { color: '#2A73FF' },
    },
    secondary: {
      color: 'text',
      // background: { color: 'bg' },
      border: {
        width: '1px',
        radius: '8px',
        color: 'softText',
      },
      padding: { horizontal: 'small', vertical: 'xsmall' },
    },
  },
  page: {
    narrow: {
      width: { max: '1130px' },
      // small: { pad: { horizontal: 'small' } },
    },
    full: {
      width: { max: '100%' },
    },
  },
  anchor: { color: 'text' },
  select: {
    //container: { extend: `background-color: bg` },
    options: {
      text: { color: 'text' },
      container: {
        // border: { color: 'white' },
        width: 'small',
        background: { ligth: 'yellow', dark: 'blue' },
        // elevation: 'large',
        // round: 'large',
      },
    },
    icons: { margin: { right: '16px', left: '10px' }, color: 'text' },
  },

  avatar: {
    size: {
      medium: '40px',
    },
  },
  card: { container: { elevation: '0', round: '8px' } },

  // menu: { icons: { color: 'text' } },
  // box: { responsiveBreakpoint: 'large' },
  tabs: {
    color: colors.BLACK_50,
    background: {
      // color: 'tab',
      // dark: true,
      // image: "url(//my.com/assets/img.png)"
      // position: "bottom",
      // opacity: true,
      // repeat: 'no-repeat',
      // size: 'cover',
      // light: 'string',
    },
    header: {
      background: 'tab',
      border: { size: 'none' },
      extend: `
      height: 36px;
      border-radius: 6px;
      overflow: hidden;
      justify-content: space-evenly;
      
      `,
    },
  },
  tab: {
    // background: 'red',
    // margin: 'none',
    extend: `
      display: flex;
      flex-grow: 1;
      
    `,
    // active: {
    //   color: 'primary',
    //   background: 'white',
    //   borderRadius: 'xsmall',
    // },
  },
  spinner: {
    container: {
      animation: 'rotateRight',
      color: 'text',
      pad: 'medium',
      round: 'full',
      size: 'large',
    },
  },
  textInput: {
    extend: ({ theme, checked, indeterminate }) =>
      `background-color: ${
        theme.global.colors.bg[theme.dark ? 'dark' : 'light']
      };`,
  },
  rangeInput: {
    extend: ({ theme }) => `
        margin: 0.7em 1em ;
      `,
    thumb: { color: 'primaryStatic' },
  },
  layer: { overlay: { background: 'container' } },
  menu: {
    item: { gap: '50px' },
    icons: { color: { dark: colors.WHITE, light: colors.BLACK } },
    group: { container: { pad: { horizontal: 'medium' } } },
  },
  checkBox: {
    border: { color: { dark: '#FFFFFF', light: '#CCCCCC' } },
    size: '18px',
    extend: () => `
      font-size: 14px;
      `,
  },
});
