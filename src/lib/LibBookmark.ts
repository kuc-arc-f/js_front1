const LibBookmark = {
  convertItems: function(items: any[], categoryItems: any[]){
    try{
      const ret: any[] = [];
      items.forEach(function (item: any){
        let row = item;
        let category = categoryItems.filter(categoryItem => (categoryItem.id === item.bmCategoryId));
        console.log(category[0]);
        console.log(item);
        /*
        item.category = null;
        if(category.length > 0){
          item.category = category[0];
        }
        */
        ret.push(item);
      });
      return ret;
    } catch (e) {
      console.log(e);
      throw new Error('error, convertItems');
    }
  },
  getCategoryName: function(categoryItems: Array<any>, bmCategoryId: number){
    try{
      let ret: string= "";
console.log(typeof categoryItems);
      const category = categoryItems.filter(categoryItem => (categoryItem.id === bmCategoryId));
//      let categoryName = "";
      if(category.length > 0){
        ret = category[0].name;
      }      
      return ret;
    } catch (e) {
      console.log(e);
      throw new Error('error, convertItems');
    }
  },  
}
export default LibBookmark;
