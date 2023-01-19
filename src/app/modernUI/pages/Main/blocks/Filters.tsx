import { useMode } from 'app/common/state';
import filter from 'app/modernUI/images/filter.svg';
import { colors, isSmall } from 'app/modernUI/theme';
import {
  Box,
  CheckBoxGroup,
  RadioButtonGroup,
  ResponsiveContext,
  Text
} from 'grommet';
import Switch from 'react-switch';
import { Filter } from '../components';

export const Filters = ({
  walletAccountAtom,
  possibleTypes,
  typeFilter,
  updateTypeFilter,
  possibleNetworks,
  possibleNonStableTokens,
  possibleStableTokens,
  updateTokenFilter,
  updateNetworkFilter,
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
    <ResponsiveContext.Consumer>
      {size => (
        <Box direction="row" margin={{ bottom: '13px' }} justify="between">
          <Box
            direction="row"
            justify="start"
            gap="13px"
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
                updateTypeFilter([], false);
                updateTokenFilter([], false);
                updateNetworkFilter([], false);
              }}
              onClose={() => {
                if (typeFilter.length == 0) {
                  updateTypeFilter(possibleTypes);
                }
                if (networkFilter.length == 0) {
                  updateNetworkFilter(possibleNetworks);
                }
                if (tokenFilter.length == 0) {
                  updateTokenFilter([
                    ...possibleNonStableTokens,
                    ...possibleStableTokens,
                  ]);
                }
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
                    updateTypeFilter(
                      typeFilter.length == possibleTypes.length
                        ? []
                        : possibleTypes,
                      typeFilter.length == possibleTypes.length ? false : true,
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
                  updateTypeFilter(event.value);
                }}
                style={
                  !walletAccountAtom
                    ? { borderBottom: `2px solid ${dividerColor}` }
                    : {}
                }
              >
                {(option, { checked }) => {
                  return (
                    <Box>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => e.target.parentElement.click()}
                      />
                    </Box>
                  );
                }}
              </CheckBoxGroup>
              {walletAccountAtom && (
                <>
                  <Text size="14px" margin={{ bottom: '12px' }}>
                    Your active farms
                  </Text>
                  <RadioButtonGroup
                    name="viewType"
                    pad={{ bottom: '28px' }}
                    options={possibleViewTypes}
                    value={viewType}
                    onChange={event => {
                      setViewType(event.target.value);
                    }}
                    style={{
                      borderBottom: `2px solid ${dividerColor}`,
                    }}
                  >
                    {(option, { checked }) => (
                      <Box direction="row" gap="12px" align="center">
                        <input
                          type="radio"
                          checked={checked}
                          onChange={e => e.target.parentElement.click()}
                          style={{ margin: '3px' }}
                        />
                        <Text size="14px">{option}</Text>
                      </Box>
                    )}
                  </RadioButtonGroup>
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
                  activeBoxShadow="0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)"
                  offColor="#CCCCCC"
                  handleDiameter={20}
                  height={14}
                  width={34}
                  checkedIcon={false}
                  uncheckedIcon={false}
                  onChange={() =>
                    updateTokenFilter(
                      tokenFilter.length ==
                        [...possibleNonStableTokens, ...possibleStableTokens]
                          .length
                        ? []
                        : [...possibleNonStableTokens, ...possibleStableTokens],
                      tokenFilter.length ==
                        [...possibleNonStableTokens, ...possibleStableTokens]
                          .length
                        ? false
                        : true,
                    )
                  }
                  checked={
                    [...possibleNonStableTokens, ...possibleStableTokens]
                      .length == tokenFilter.length
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
                  updateTokenFilter(event.value);
                }}
              >
                {(option, { checked }) => {
                  return (
                    <Box>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => e.target.parentElement.click()}
                      />
                    </Box>
                  );
                }}
              </CheckBoxGroup>
              <Text size="14px" margin={{ bottom: '12px' }}>
                Other tokens
              </Text>
              <CheckBoxGroup
                pad={{ bottom: '28px' }}
                options={possibleNonStableTokens}
                value={tokenFilter}
                onChange={event => {
                  updateTokenFilter(event.value);
                }}
                style={{
                  borderBottom: `2px solid ${dividerColor}`,
                }}
              >
                {(option, { checked }) => {
                  return (
                    <Box>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => e.target.parentElement.click()}
                      />
                    </Box>
                  );
                }}
              </CheckBoxGroup>
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
                  activeBoxShadow="0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)"
                  offColor="#CCCCCC"
                  handleDiameter={20}
                  height={14}
                  width={34}
                  checkedIcon={false}
                  uncheckedIcon={false}
                  onChange={() =>
                    updateNetworkFilter(
                      networkFilter.length == possibleNetworks.length
                        ? []
                        : possibleNetworks,
                      networkFilter.length == possibleNetworks.length
                        ? false
                        : true,
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
                  updateNetworkFilter(event.value);
                }}
              >
                {(option, { checked }) => {
                  return (
                    <Box>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => e.target.parentElement.click()}
                      />
                    </Box>
                  );
                }}
              </CheckBoxGroup>
            </Filter>
            <Filter
              heading={
                typeFilter.length == 1
                  ? typeFilter[0]
                  : typeFilter.length > 1 &&
                    typeFilter.length < possibleTypes.length
                  ? `${typeFilter[typeFilter.length - 1]} + ${
                      typeFilter.length - 1
                    }`
                  : 'Farms'
              }
              isFiltering={typeFilter.length != possibleTypes.length}
              onClear={() => updateTypeFilter([], false)}
              onReset={() => {
                updateTypeFilter(possibleTypes);
              }}
              onClose={() => {
                if (typeFilter.length == 0) {
                  updateTypeFilter(possibleTypes);
                }
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
                  activeBoxShadow="0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)"
                  offColor="#CCCCCC"
                  handleDiameter={20}
                  height={14}
                  width={34}
                  checkedIcon={false}
                  uncheckedIcon={false}
                  onChange={() =>
                    updateTypeFilter(
                      typeFilter.length == possibleTypes.length
                        ? []
                        : possibleTypes,
                      typeFilter.length == possibleTypes.length ? false : true,
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
                  updateTypeFilter(event.value);
                }}
              >
                {(option, { checked }) => {
                  return (
                    <Box>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => e.target.parentElement.click()}
                      />
                    </Box>
                  );
                }}
              </CheckBoxGroup>
              {walletAccountAtom && (
                <>
                  <Text size="14px" margin={{ bottom: '12px' }}>
                    Your active farms
                  </Text>
                  <RadioButtonGroup
                    name="viewType"
                    pad={{ bottom: '28px' }}
                    options={possibleViewTypes}
                    value={viewType}
                    onChange={event => {
                      setViewType(event.target.value);
                    }}
                  >
                    {(option, { checked }) => (
                      <Box direction="row" gap="12px" align="center">
                        <input
                          type="radio"
                          checked={checked}
                          onChange={e => e.target.parentElement.click()}
                          style={{ margin: '3px' }}
                        />
                        <Text size="14px">{option}</Text>
                      </Box>
                    )}
                  </RadioButtonGroup>
                </>
              )}
            </Filter>
            <Filter
              heading={
                tokenFilter.length == 1
                  ? tokenFilter[0]
                  : tokenFilter.length > 1 &&
                    tokenFilter.length <
                      [...possibleNonStableTokens, ...possibleStableTokens]
                        .length
                  ? `${tokenFilter[tokenFilter.length - 1]} + ${
                      tokenFilter.length - 1
                    }`
                  : 'Tokens'
              }
              isFiltering={
                tokenFilter.length !=
                [...possibleNonStableTokens, ...possibleStableTokens].length
              }
              onReset={() =>
                updateTokenFilter([
                  ...possibleNonStableTokens,
                  ...possibleStableTokens,
                ])
              }
              onClear={() => updateTokenFilter([], false)}
              onClose={() => {
                if (tokenFilter.length == 0) {
                  updateTokenFilter([
                    ...possibleNonStableTokens,
                    ...possibleStableTokens,
                  ]);
                }
              }}
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
                  activeBoxShadow="0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)"
                  offColor="#CCCCCC"
                  handleDiameter={20}
                  height={14}
                  width={34}
                  checkedIcon={false}
                  uncheckedIcon={false}
                  onChange={() =>
                    updateTokenFilter(
                      tokenFilter.length ==
                        [...possibleNonStableTokens, ...possibleStableTokens]
                          .length
                        ? []
                        : [...possibleNonStableTokens, ...possibleStableTokens],
                      tokenFilter.length ==
                        [...possibleNonStableTokens, ...possibleStableTokens]
                          .length
                        ? false
                        : true,
                    )
                  }
                  checked={
                    [...possibleNonStableTokens, ...possibleStableTokens]
                      .length == tokenFilter.length
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
                  updateTokenFilter(event.value);
                }}
              >
                {(option, { checked }) => {
                  return (
                    <Box>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => e.target.parentElement.click()}
                      />
                    </Box>
                  );
                }}
              </CheckBoxGroup>
              <Text size="14px" margin={{ bottom: '12px' }}>
                Other tokens
              </Text>
              <CheckBoxGroup
                pad={{ bottom: '28px' }}
                options={possibleNonStableTokens}
                value={tokenFilter}
                onChange={event => {
                  updateTokenFilter(event.value);
                }}
              >
                {(option, { checked }) => {
                  return (
                    <Box>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => e.target.parentElement.click()}
                      />
                    </Box>
                  );
                }}
              </CheckBoxGroup>
            </Filter>
            <Filter
              heading={
                networkFilter.length == 1
                  ? networkFilter[0]
                  : networkFilter.length > 1 &&
                    networkFilter.length < possibleNetworks.length
                  ? `${networkFilter[networkFilter.length - 1]} + ${
                      networkFilter.length - 1
                    }`
                  : 'Networks'
              }
              onReset={() => {
                updateNetworkFilter(possibleNetworks);
              }}
              onClear={() => updateNetworkFilter([], false)}
              onClose={() => {
                if (networkFilter.length == 0) {
                  updateNetworkFilter(possibleNetworks);
                }
              }}
              isFiltering={networkFilter.length != possibleNetworks.length}
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
                  activeBoxShadow="0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)"
                  offColor="#CCCCCC"
                  handleDiameter={20}
                  height={14}
                  width={34}
                  checkedIcon={false}
                  uncheckedIcon={false}
                  onChange={() =>
                    updateNetworkFilter(
                      networkFilter.length == possibleNetworks.length
                        ? []
                        : possibleNetworks,
                      networkFilter.length == possibleNetworks.length
                        ? false
                        : true,
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
                  updateNetworkFilter(event.value);
                }}
              >
                {(option, { checked }) => {
                  return (
                    <Box>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => e.target.parentElement.click()}
                      />
                    </Box>
                  );
                }}
              </CheckBoxGroup>
            </Filter>
          </Box>
          {walletAccountAtom && !isSmall(size) && (
            <Box direction="row" gap="9px" align="center">
              <Text size="14px">View my farms only</Text>
              <Switch
                onColor="#AAC7FF"
                onHandleColor="#2A73FF"
                offHandleColor="#FAFAFA"
                activeBoxShadow="0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)"
                offColor="#CCCCCC"
                handleDiameter={20}
                height={14}
                width={34}
                checkedIcon={false}
                uncheckedIcon={false}
                onChange={() => {
                  if (viewType == 'View my farms only') {
                    setViewType('View all farms');
                  } else {
                    setViewType('View my farms only');
                  }
                }}
                checked={viewType == 'View my farms only'}
              />
            </Box>
          )}
        </Box>
      )}
    </ResponsiveContext.Consumer>
  );
};
