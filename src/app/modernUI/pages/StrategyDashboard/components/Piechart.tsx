import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend, Label } from 'recharts';
import { Spinner } from 'grommet';
const tempData = [
    { name: 'Loading...', value: 0, apy: 0 },

];

const colorArrays = {
    reds: ['#fdcbb6', '#fcb398', '#fc997a', '#fc8060', '#fa6648', '#f34935', '#e32f27', '#cc191e', '#b51318', '#980c13', '#71020e'],
    blues: ['#d0e2f2', '#bed8ec', '#a5cde3', '#87bddc', '#68acd5', '#4e9acb', '#3787c0', '#2272b6', '#125ea6', '#084a91', '#083573'],
    greens: ['#d4eece', '#c0e6b9', '#a8dca2', '#8dd08a', '#70c274', '#50b264', '#37a055', '#248c46', '#0e7936', '#006428', '#004a1e'],
    purples: ['#e3e2ef', '#d4d4e8', '#c1c2df', '#aeadd3', '#9c98c7', '#8986be', '#796eb2', '#6b53a4', '#5d3897', '#4f1f8b', '#420680'],
    oranges: ['#fdd9b5', '#fdc997', '#fdb475', '#fd9f56', '#fc8a39', '#f5741f', '#e95e0d', '#da4902', '#bb3d02', '#9e3303', '#852904'],
    grays: ['#323232', '#464646', '#5a5a5a', '#6e6e6e', '#828282', '#969696', '#aaaaaa', '#bebebe', '#d2d2d2', '#e6e6e6', '#fafafa'],
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index,
}) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};
const renderLegend = (props) => {
    const { payload } = props;

    return (
        <ul>
            {
                payload.map((entry, index) => (
                    <li key={`item-${index}`} style={{ color: entry.color }}>
                        {`${entry.payload.name} (${entry.payload.apy.toFixed(2)}% APY)`}
                    </li>
                ))
            }
        </ul>
    );
};


export const Piechart = ({ data, title, index }) => {
    const renderData = data.length !== 0 ? data : tempData
    const totalValue = renderData.reduce((acc, item) => acc + item.value, 0);
    // Calculate the weighted average APY
    const weightedApy = data.reduce((total, entry) => total + ((entry.value / totalValue) * entry.apy), 0);

    console.log(data);

    return (
        <div>
            <h4>{title}</h4>
            {totalValue === 0 ? <p>Total: ...</p> : <p>Total: {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {title.split(" ")[0]}</p>}
            {totalValue === 0 ? <p>Weighted APY: ...</p> : <p>Weighted APY: {weightedApy.toFixed(2)}%</p>}

            <ResponsiveContainer height={500}>
                <PieChart>
                    <Pie
                        data={renderData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius="80%"
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={(data, index) => {
                            // console.log(`Mouse entered on slice: ${data.name}`);
                        }}
                    >
                        {
                            renderData.map((entry, pieIndex) => {
                                // Select a color class in order
                                const colorClass = Object.keys(colorArrays)[pieIndex % Object.keys(colorArrays).length];
                                // Select a color from the chosen class based on the index prop
                                const color = colorArrays[colorClass][index % colorArrays[colorClass].length];
                                return <Cell key={`cell-${pieIndex}`} fill={color} />
                            })
                        }
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} content={renderLegend} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};