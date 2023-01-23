// 각종 라이브러리 설치

const express = require('express');     // express 라는 변수에 아까 설치한 익스프레스 라이브러리 가져오기
const app = express();                  // 그 라이브러리를 변수에 담음.
app.use(express.urlencoded({extended: true})); // 요청내용을 보기 편하게 하는 라이브러리 
app.set('view engine', 'ejs');
app.use('/public', express.static('public')); // static파일 보관을 위해 public 폴더 쓸꺼임.

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

//  end - 각종 라이브러리 설치

const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.xlqugu9.mongodb.net/?retryWrites=true&w=majority',function(에러, client) {
    //연결되면 할 일
    if(에러) return console.log(에러);
    db = client.db('todoapp');

    app.listen(8080, function() {           
        console.log('listening on 8080'); 
    }); 
})

app.get('/', function(요청, 응답방법) { 
    응답방법.render('index.ejs')
})

app.get('/write', function(요청내용, 응답방법) { 
    응답방법.render('write.ejs')
})

app.get('/list', function(요청, 응답){
    db.collection('post').find().toArray(function(에러, 결과){
      console.log(결과)
      응답.render('list.ejs', { posts : 결과 })
    })
  }) 

// /add 라는 주소에서 post 전송요청이 오면
app.post('/add', (요청내용, 응답방법) => {
    응답방법.send('데이터 전송 완료') // 다음 페이지에 이 문구를 보여주세요. 이거 안쓰면 화면이 안넘어가서 에러 난 줄;
    //첫 번째 쿼리문 실행 : db에 counter 라는 이름의 table을 찾고. name이 게시물갯수 라는 항목을 찾으셈.
    db.collection('counter').findOne({name:'게시물갯수'}, (에러, 결과) => {
        if(에러){return console.log(에러);}

        // name이 '게시물갯수'인 항목 중에 totalPost 라는 값을 변수에 담음.
        var 총게시물갯수 = 결과.totalPost; // 현재 값 0

        // 두 번째 쿼리문 실행 : post 라는 table에 데이터 () 안의 값들을 insert하셈
        // 고유id의 값에는 총게시물갯수에 + 1을 한 값을 삽입.
        db.collection('post').insertOne({_id : 총게시물갯수 + 1, 제목:요청내용.body.title, 날짜:요청내용.body.date}, (에러, 결과) => {
            if(에러){return console.log(에러);}

            //세 번째 쿼리문 실행 : counter테이블에 게시물갯수 항목의 값 중 totalPost라는 값을 기존 값에 +1을 더해주셈.
            //$inc : {totalPost:1} == totalPost의 현재 값에 +1을 해주셈. 기존mysql의 autoinc 기능
            //$set : {totalPost:100} == totalPost의 값을 100 으로 바꿔주셈.
            db.collection('counter').updateOne({name : '게시물갯수'}, {$inc: {totalPost:1}}, (에러, 결과)=>{
                if(에러){return console.log(에러);}
            })
        });
    });
})

app.delete('/delete', (요청내용, 응답방법)=> {
    요청내용.body._id = parseInt(요청내용.body._id);
    console.log(요청내용.body);
    db.collection('post').deleteOne(요청내용.body, (에러, 결과) => {
        console.log('삭제 완료');
        응답방법.status(200).send({message : '성공했습니다.'});
    })
})

app.get('/detail/:id', function(요청, 응답){
    db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과) {
        console.log(결과);
        if(에러) {
            console.log(에러)
        } else if (결과) {
            응답.render('detail.ejs', {data : 결과});
        } else if (결과 === null) {
            응답.status(500).send({message : "없는 글 번호입니다."})

        }
    })
})

app.get('/edit/:id', function(요청, 응답) {
    db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과) {
        console.log(결과);
        if(에러) {
            console.log(에러)
        } else if (결과) {
            응답.render('edit.ejs', {post : 결과});
        } else if (결과 === null) {
            응답.status(500).send({message : "주소 오류."})
        }
        
    })
    
})

app.put('/edit', function(요청, 응답) {
    db.collection('post').updateOne({_id : parseInt(요청.body.id) },{$set : {제목 : 요청.body.title, 날짜 : 요청.body.date}},function(에러, 결과) {
        console.log(요청);
        console.log(요청.body);
        console.log('터미널 : 수정 완료');
        응답.redirect('/list');
    })
})