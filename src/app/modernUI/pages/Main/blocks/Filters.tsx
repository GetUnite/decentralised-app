import { useMode } from 'app/common/state';
import filter from 'app/modernUI/images/filter.svg';
import { colors } from 'app/modernUI/theme';
import { Box, CheckBoxGroup, RadioButtonGroup, Text } from 'grommet';
import Switch from 'react-switch';
import { Filter } from '../components';

export const Filters = ({
  walletAccountAtom,
  possibleTypes,
  typeFilter,
  setTypeFilter,
  possibleNetworks,
  possibleNonStableTokens,
  possibleStableTokens,
  setTokenFilter,
  setNetworkFilter,
  tokenFilter,
  networkFilter,
  possibleViewTypes,
  setViewType,
  viewType,
  ...rest
}) => {
  const { isLightMode } = useMode();

  const dividerColor = isLightMode ? '#EBEBEB' : '#999999';

  return (
    <Box direction="row">
      <Box
        direction="row"
        justify="start"
        gap="20px"
        style={{ fontSize: '16px' }}
      >
        <Filter
          heading="All filters"
          style={{ width: '80px', padding: 0 }}
          icon={filter}
          buttonStyle={{ color: colors.BLUE, fontSize: '14px' }}
          plain
          options={possibleTypes}
          value={typeFilter}
          onClear={() => {
            setTypeFilter([]);
            setTokenFilter([]);
            setNetworkFilter([]);
          }}
        >
          <Box
            direction="row"
            justify="between"
            align="center"
            margin={{ top: '20px', bottom: '12px' }}
          >
            <Text size="16px" weight={600}>
              Select all farms
            </Text>
            <Switch
              onColor="#AAC7FF"
              onHandleColor="#2A73FF"
              offHandleColor="#FAFAFA"
              activeBoxShadow="0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12);"
              offColor="#CCCCCC"
              handleDiameter={20}
              height={14}
              width={34}
              checkedIcon={false}
              uncheckedIcon={false}
              onChange={() =>
                setTypeFilter(
                  typeFilter.length == possibleTypes.length
                    ? []
                    : possibleTypes,
                )
              }
              checked={possibleTypes.length == typeFilter.length}
            />
          </Box>
          <CheckBoxGroup
            pad={{ bottom: '28px' }}
            options={possibleTypes}
            value={typeFilter}
            onChange={event => {
              setTypeFilter(event.value);
            }}
            style={
              !walletAccountAtom
                ? { borderBottom: `2px solid ${dividerColor}` }
                : {}
            }
          />
          {walletAccountAtom && (
            <>
              <Text size="14px" margin={{ bottom: '12px' }}>
                Your active farms
              </Text>
              <RadioButtonGroup
                name="teste"
                pad={{ bottom: '28px' }}
                options={possibleViewTypes}
                value={viewType}
                onChange={event => {
                  setViewType(event.target.value);
                }}
                style={{
                  borderBottom: `2px solid ${dividerColor}`,
                }}
              />
            </>
          )}
          <Box
            direction="row"
            justify="between"
            align="center"
            margin={{ top: '20px', bottom: '12px' }}
          >
            <Text size="16px" weight={600}>
              Select all tokens
            </Text>
            <Switch
              onColor="#AAC7FF"
              onHandleColor="#2A73FF"
              offHandleColor="#FAFAFA"
              activeBoxShadow="0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12);"
              offColor="#CCCCCC"
              handleDiameter={20}
              height={14}
              width={34}
              checkedIcon={false}
              uncheckedIcon={false}
              onChange={() =>
                setTokenFilter(
                  tokenFilter.length ==
                    [...possibleNonStableTokens, ...possibleStableTokens].length
                    ? []
                    : [...possibleNonStableTokens, ...possibleStableTokens],
                )
              }
              checked={
                [...possibleNonStableTokens, ...possibleStableTokens].length ==
                tokenFilter.length
              }
            />
          </Box>
          <Text size="14px" margin={{ bottom: '12px' }}>
            Stablecoins
          </Text>
          <CheckBoxGroup
            pad={{ bottom: '28px' }}
            options={possibleStableTokens}
            value={tokenFilter}
            onChange={event => {
              setTokenFilter(event.value);
            }}
          />
          <Text size="14px" margin={{ bottom: '12px' }}>
            Other tokens
          </Text>
          <CheckBoxGroup
            pad={{ bottom: '28px' }}
            options={possibleNonStableTokens}
            value={tokenFilter}
            onChange={event => {
              setTokenFilter(event.value);
            }}
            style={{
              borderBottom: `2px solid ${dividerColor}`,
            }}
          />
          <Box
            direction="row"
            justify="between"
            align="center"
            margin={{ top: '20px', bottom: '12px' }}
          >
            <Text size="16px" weight={600}>
              Select all networks
            </Text>
            <Switch
              onColor="#AAC7FF"
              onHandleColor="#2A73FF"
              offHandleColor="#FAFAFA"
              activeBoxShadow="0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12);"
              offColor="#CCCCCC"
              handleDiameter={20}
              height={14}
              width={34}
              checkedIcon={false}
              uncheckedIcon={false}
              onChange={() =>
                setNetworkFilter(
                  networkFilter.length == possibleNetworks.length
                    ? []
                    : possibleNetworks,
                )
              }
              checked={possibleNetworks.length == networkFilter.length}
            />
          </Box>
          <CheckBoxGroup
            pad={{ bottom: '28px' }}
            options={possibleNetworks}
            value={networkFilter}
            onChange={event => {
              setNetworkFilter(event.value);
            }}
          />
        </Filter>
        <Filter
          heading="Farms"
          style={{ width: '80px', padding: 0 }}
          plain
          options={possibleTypes}
          value={typeFilter}
          onClear={() => setTypeFilter([])}
        >
          <Box
            direction="row"
            justify="between"
            align="center"
            margin={{ top: '20px', bottom: '12px' }}
          >
            <Text size="16px" weight={600}>
              Select all farms
            </Text>
            <Switch
              onColor="#AAC7FF"
              onHandleColor="#2A73FF"
              offHandleColor="#FAFAFA"
              activeBoxShadow="0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12);"
              offColor="#CCCCCC"
              handleDiameter={20}
              height={14}
              width={34}
              checkedIcon={false}
              uncheckedIcon={false}
              onChange={() =>
                setTypeFilter(
                  typeFilter.length == possibleTypes.length
                    ? []
                    : possibleTypes,
                )
              }
              checked={possibleTypes.length == typeFilter.length}
            />
          </Box>
          <CheckBoxGroup
            pad={{ bottom: '28px' }}
            options={possibleTypes}
            value={typeFilter}
            onChange={event => {
              setTypeFilter(event.value);
            }}
          />
          {walletAccountAtom && (
            <>
              <Text size="14px" margin={{ bottom: '12px' }}>
                Your active farms
              </Text>
              <RadioButtonGroup
                name="teste"
                pad={{ bottom: '28px' }}
                options={possibleViewTypes}
                value={viewType}
                onChange={event => {
                  setViewType(event.target.value);
                }}
              />
            </>
          )}
        </Filter>
        <Filter
          heading="Tokens"
          style={{ width: '80px', padding: 0 }}
          plain
          onClear={() => setTokenFilter([])}
        >
          <Box
            direction="row"
            justify="between"
            align="center"
            margin={{ top: '20px', bottom: '12px' }}
          >
            <Text size="16px" weight={600}>
              Select all tokens
            </Text>
            <Switch
              onColor="#AAC7FF"
              onHandleColor="#2A73FF"
              offHandleColor="#FAFAFA"
              activeBoxShadow="0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12);"
              offColor="#CCCCCC"
              handleDiameter={20}
              height={14}
              width={34}
              checkedIcon={false}
              uncheckedIcon={false}
              onChange={() =>
                setTokenFilter(
                  tokenFilter.length ==
                    [...possibleNonStableTokens, ...possibleStableTokens].length
                    ? []
                    : [...possibleNonStableTokens, ...possibleStableTokens],
                )
              }
              checked={
                [...possibleNonStableTokens, ...possibleStableTokens].length ==
                tokenFilter.length
              }
            />
          </Box>
          <Text size="14px" margin={{ bottom: '12px' }}>
            Stablecoins
          </Text>
          <CheckBoxGroup
            pad={{ bottom: '28px' }}
            options={possibleStableTokens}
            value={tokenFilter}
            onChange={event => {
              setTokenFilter(event.value);
            }}
          />
          <Text size="14px" margin={{ bottom: '12px' }}>
            Other tokens
          </Text>
          <CheckBoxGroup
            pad={{ bottom: '28px' }}
            options={possibleNonStableTokens}
            value={tokenFilter}
            onChange={event => {
              setTokenFilter(event.value);
            }}
          />
        </Filter>
        <Filter
          heading="Networks"
          style={{ width: '100px', padding: 0 }}
          plain
          onClear={() => setNetworkFilter([])}
        >
          <Box
            direction="row"
            justify="between"
            align="center"
            margin={{ top: '20px', bottom: '12px' }}
          >
            <Text size="16px" weight={600}>
              Select all networks
            </Text>
            <Switch
              onColor="#AAC7FF"
              onHandleColor="#2A73FF"
              offHandleColor="#FAFAFA"
              activeBoxShadow="0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12);"
              offColor="#CCCCCC"
              handleDiameter={20}
              height={14}
              width={34}
              checkedIcon={false}
              uncheckedIcon={false}
              onChange={() =>
                setNetworkFilter(
                  networkFilter.length == possibleNetworks.length
                    ? []
                    : possibleNetworks,
                )
              }
              checked={possibleNetworks.length == networkFilter.length}
            />
          </Box>
          <CheckBoxGroup
            pad={{ bottom: '28px' }}
            options={possibleNetworks}
            value={networkFilter}
            onChange={event => {
              setNetworkFilter(event.value);
            }}
          />
        </Filter>
      </Box>
    </Box>
  );
};
