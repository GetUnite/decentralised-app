import ReactTooltip from "react-tooltip";
import { Box, Text } from 'grommet'
import styled from "styled-components";
import { useRecoilState } from 'recoil';
import { mode } from "app/common/state/atoms";

export default function SlideButton({biconomyStatus, setBiconomyStatus}) {

  const [modeAtom] = useRecoilState(mode);
  const biconomyStatusButton = biconomyStatus ? 'row' : 'row-reverse';
  const biconomyStatusButtonColor = !biconomyStatus ? '#CCCCCC' : '#2A73FF';

  return (
    <Box 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexDirection: 'row',
      }}
      >
      <Text
        style={{
          marginRight: '1vw',
          color: '#999999',
          fontWeight: '500',
          fontSize: '14px'
        }}
        >
        { biconomyStatus ?  
        <span 
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          fontSize: '12px'
        }}
        >Turn off<span style={{textDecoration: 'underline', marginLeft: '5px'}}
        data-tip data-for="biconomyTip"
        > Biconomy</span></span> 
        : 
        <span
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          fontSize: '12px'
        }}
        >Turn on <p style={{textDecoration: 'underline', marginLeft: '5px'}}
        data-tip data-for="biconomyTip"> Biconomy</p></span> 
        }
      </Text>
      <Box
        style={{
          width: '45px',
          backgroundColor: biconomyStatusButtonColor,
          borderRadius: '15px',
          padding: '0px 5px 0px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: biconomyStatusButton
        }}
      >
      <Text
        style={{
          opacity: '0.5',
          fontSize: '11px',
          color: 'white',
          textAlign: 'center'
        }}
      >{biconomyStatus ? 'On' : 'Off'}</Text>
      <button
        data-tip data-for="biconomyTip"
        style={{
          width: '13px',
          height: '13px',
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '50px',
          color: 'white',
          cursor: 'pointer',
          border: 'none'
        }}
    
        onClick={
          biconomyStatus?
          () => setBiconomyStatus(false)
          :
          () => setBiconomyStatus(true)
        }
      />
      {
        modeAtom === 'light' ? 
        <ReactTooltipStyledLight id="biconomyTip" place="bottom" effect="float">
          Turning off Biconomy means Alluo will no longer pay your transaction fee. 
        </ReactTooltipStyledLight>
        :
        <ReactTooltipStyledDark id="biconomyTip" place="bottom" effect="float">
          Turning off Biconomy means Alluo will no longer pay your transaction fee. 
        </ReactTooltipStyledDark>
      }
    </Box>
    </Box>
  )
}

export const ReactTooltipStyledDark = styled(ReactTooltip)`
&.place-bottom {
  background: #44444;
  border-radius: 8px;
  width: 262px;
  height: 48px;
  color: #FFFFF;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
}
`

export const ReactTooltipStyledLight = styled(ReactTooltip)`
  &.place-bottom {
    background: #F4F8FF;
    border-radius: 8px;
    width: 262px;
    height: 48px;
    color: #4C4C4C;
    font-weight: 400;
    font-size: 13px;
    line-height: 18px;
  }
`;
