var albumBucketName = "my-web-photo-viewer-topicos";
var bucketRegion = "us-east-1";
var IdentityPoolId = "us-east-1:dbbe8c8e-786d-41dd-8e62-3706c8daa853";

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName }
});

function iniciateAlbum() {
  s3.listObjects({ Delimiter: "/" }, function(err, data) {
    if (err) {
      return alert("erro: " + err.message);
    } else {
      var htmlTemplate = [
        "<span>Clique no botão para iniciar</span><br><br>",
        "<button onclick=\"createAlbum('album-test-3')\">",
        "INICIAR",
        "</button>"
      ];
      document.getElementById("app").innerHTML = getHtml(htmlTemplate);
    }
  });
}

function createAlbum(albumName) {
  albumName = albumName.trim();
  var albumKey = encodeURIComponent(albumName);
  s3.headObject({ Key: albumKey }, function(err, data) {
    if (!err) {
      return alert("Album já exist.");
    }
    if (err.code !== "NotFound") {
      return alert("Erro ao iniciar o album: " + err.message);
    }
    s3.putObject({ Key: albumKey }, function(err, data) {
      if (err) {
        return alert("Erro ao iniciar o album: " + err.message);
      }
      alert("Album iniciado com sucesso.");
      viewAlbum(albumName);
    });
  });
}

function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + "/";
  s3.listObjects({ Prefix: albumPhotosKey }, function(err, data) {
    if (err) {
      return alert("Erro para localizar o album: " + err.message);
    }
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + "/";

    var photos = data.Contents.map(function(photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return getHtml([
        "<span>",
        "<div>",
        '<img style="width:128px;height:128px;" src="' + photoUrl + '"/>',
        "</div>",
        "<div>",
        "<span>",
        photoKey.replace(albumPhotosKey, ""),
        "</span>",
        "</div>",
        "</span>"
      ]);
    });
    var message = photos.length
      ? ""
      : "<p>Adicione a primeira foto.</p>";
    var htmlTemplate = [
      message,
      "<div>",
      getHtml(photos),
      "</div>",
      '<input id="photoupload" type="file" accept="image/*">',
      '<button id="addphoto" onclick="addPhoto(\'' + albumName + "')\">",
      "ADICIONAR",
      "</button>"
    ];
    document.getElementById("app").innerHTML = getHtml(htmlTemplate);
  });
}

function addPhoto(albumName) {
  var files = document.getElementById("photoupload").files;
  if (!files.length) {
    return alert("Escolha uma foto primeiro .");
  }
  var file = files[0];
  var fileName = file.name;
  var albumPhotosKey = encodeURIComponent(albumName) + "/";

  var photoKey = albumPhotosKey + fileName;

  var upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: albumBucketName,
      Key: photoKey,
      Body: file
    }
  });

  var promise = upload.promise();

  promise.then(
    function(data) {
      alert("Foto adicionada.");
      viewAlbum(albumName);
    },
    function(err) {
      return alert("Erro ao adicionar foto: ", err.message);
    }
  );
}
