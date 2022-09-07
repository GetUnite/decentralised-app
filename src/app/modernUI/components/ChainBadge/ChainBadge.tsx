import { EChain } from 'app/common/functions/Web3Client';
import { Box, Text, BoxExtendedProps } from 'grommet';

interface IChainBadge extends BoxExtendedProps {
  chain: EChain;
}

export const ChainBadge = ({ chain, ...rest }: IChainBadge) => {
  const backgroundColor = chain === EChain.ETHEREUM ? '#EEF0FB' : '';
  const textColor = chain === EChain.ETHEREUM ? '#687DE3' : '';
  const chainName = chain === EChain.ETHEREUM ? 'Ethereum' : 'Polygon';
  
  return (
    <Box justify="start" align="start">
      <Box
        background="badge"
        height="24px"
        align="center"
        round="small"
        justify="center"
        width="76px"
        pad="small"
        style={{ backgroundColor: backgroundColor, borderRadius: '6px' }}
        {...rest}
      >
        <Text style={{ color: textColor }} size="small">
          {chainName}
        </Text>
      </Box>
    </Box>
  );
};
