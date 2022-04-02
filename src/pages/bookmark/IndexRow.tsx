import Link from 'next/link';
import moment from 'moment';
import LibBookmark from '@/lib/LibBookmark';

/*
interface IProps {
  categoryItems: Array<any>,
  id: number,
  title: string,
  url: string,
  date: any,
  bmCategoryId: number,
}
*/
const IndexRow = function (props){
  const categoryItems: Array<any> = props.categoryItems;
  let dtObj = new Date(Number(props.date));
  let dt = moment(dtObj);
  const dtStr = dt.format("YYYY-MM-DD HH:mm")
  //console.log(typeof props.date)
  //console.log(String(dtObj) )
  return (
  <tr>
    <td>
      <h3>
        <Link href={`${props.url}`}><a target="_brank">{props.title}</a>
        </Link>
      </h3>
      {/*
      <Link href={`${props.url}`}><a target="_brank">{props.url}</a>
      </Link>
      */}
      {props.url}
      <Link href={`${props.url}`}>
        <a className='btn btn-sm btn-outline-primary mx-2' target="_brank">Open</a>
      </Link><br />
      {props.categoryName} {dtStr} , ID: {props.id}
    </td>
    <td>
      <Link href={`/bookmark/edit/${props.id}`}>
        <a className="btn btn-sm btn-outline-primary"> Edit</a>
      </Link>
    </td>
  </tr>
  )
};
export default IndexRow;
