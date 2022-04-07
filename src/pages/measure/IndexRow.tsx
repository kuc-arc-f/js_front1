import Link from 'next/link';
//import Header from '../Layout/AppHead';

const IndexRow = props => (
  <tr>
    <td>
      <h3>
      <a>{props.mvalue}</a>
      </h3>
      {props.date} , ID: {props.id}
    </td>
    <td>
      <Link href={`/measure/edit/${props.id}`}>
        <a className="btn btn-sm btn-outline-primary"> Edit</a>
      </Link>
    </td>
  </tr>
);
export default IndexRow;
