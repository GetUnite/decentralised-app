import { EChain } from 'app/common/constants/chains';
import { Box, BoxExtendedProps, Text } from 'grommet';

interface IChainBadge extends BoxExtendedProps {
  chain: EChain;
}

export const ChainBadge = ({ chain, ...rest }: IChainBadge) => {
  const backgroundColor = chain === EChain.ETHEREUM ? '#BDC5FF' : '';
  const textColor = chain === EChain.ETHEREUM ? '#5262B2' : '';
  const chainName = chain === EChain.ETHEREUM ? 'Ethereum' : 'Polygon';
  
  return (
    <Box justify="start" align="start">
      <Box
        background="badge"
        height="32px"
        align="center"
        round="small"
        justify="center"
        width="80px"
        pad="small"
        style={{ backgroundColor: backgroundColor, borderRadius: '6px' }}
        {...rest}
      >
        <Text style={{ color: textColor }} size="13px">
          {chainName}
        </Text>
      </Box>
    </Box>
  );
};
