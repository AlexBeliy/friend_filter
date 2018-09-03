///////////////////// API VK ///////////////////////
VK.init({
    apiId: 6677209
});

function auth() {
    return new Promise((resolve, reject) => {
        VK.Auth.login(data => {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Не удалось авторизироваться!'));
            }
        }, 2); //2 - идентификатор прав https://vk.com/dev/permissions
    });
}

function callAPI(method, params) {
    params.v = '5.76';

    return new Promise((resolve, reject) => {
        VK.api(method, params, (data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);
            }
        })
    })
}

auth()
    .then(() => {
        return callAPI('users.get', { name_case: 'gen' });
    })
    .then((me) => {
        return callAPI('friends.get', { fields: 'photo_100' });
    })
    .then(friends => {
        renderElement(friends);
    });

///////////////////// Создание элементов  ///////////////////////
const leftArray = [];
const rightArray = [];

const leftList = document.querySelector('.main__left-list');
const rightList = document.querySelector('.main__right-list');

function renderElement(data) {
    console.log(data);
    data.items.map(createElement).forEach(node => {

        listDistribute();
    });

    localStorageLoad();
}

function createElement(data) {
    const friendNode = document.createElement('div');
    const name = document.createElement('div');
    const photo = document.createElement('img');
    const btnPlus = document.createElement('div');
    const btnTimes = document.createElement('div');

    btnTimes.classList.add('btnTimes');
    btnPlus.classList.add('btnPlus');

    photo.classList.add('photo');
    name.classList.add('name');

    btnTimes.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
    btnPlus.innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i>';
    name.textContent = `${data.first_name}  ${data.last_name}`;
    photo.src = data.photo_100;

    friendNode.appendChild(photo);
    friendNode.appendChild(name);
    friendNode.draggable = true;

    const friendNodeRight = friendNode.cloneNode(true);
    friendNode.appendChild(btnPlus);
    friendNode.classList.add('friendLeft');

    friendNodeRight.appendChild(btnTimes)
    friendNodeRight.classList.add('friendRight');

    leftArray.push(friendNode);
    rightArray.push(friendNodeRight);

}

function listDistribute() {
    for (var i= 0 ; i < leftArray.length; i++) {
        leftList.appendChild(leftArray[i]);
        rightList.appendChild(rightArray[i]);
        rightArray[i].style.display = 'none';
    }
   
}

///////////////////// Перетаскивание элементов  ///////////////////////

function addElementInList(e, class1 = 'fa fa-plus', class2 = 'fa fa-times') {
    if (e.target.className === class1 && this == leftList) {

        replace(rightArray, '.friendLeft', e);

    } else if (e.target.className === class2 && this == rightList) {
        replace(leftArray, '.friendRight', e);
    }
}

function replace(arr, classes, e) {
    var parent = e.target.closest(classes);
    for (var item of arr) {
        if (item.textContent == parent.textContent) {
            item.style.cssText = 'display: "";';
            parent.style.cssText = 'display: none;'
        }
    }
}

leftList.addEventListener('click', addElementInList);
rightList.addEventListener('click', addElementInList);

//////////////////// dnd ///////////////////////

var currentDrag;

function dndReplace(arr, currentDrag) {
    parent = currentDrag;
    for (var item of arr) {
        if (item.textContent == parent.textContent) {
            item.style.cssText = 'display: "";';
            parent.style.cssText = 'display: none;'
        }
    }
}

document.addEventListener('dragstart', (e) => {
    if (e.target.className == 'friendLeft' || e.target.className == 'friendRight') {
        currentDrag = { node: e.target };
        getCurrentZone(e.target, 'list-wrap');
    }
});

document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    if (currentDrag) {

        e.preventDefault();

        console.log(currentDrag.node)
        var from = getCurrentZone(e.target, 'list-wrap');

        if (from.classList.contains('list-wrap')) {
            if (from.firstElementChild.className == 'main__right-list') {
                dndReplace(rightArray, currentDrag.node)
            } else if ((from.firstElementChild.className == 'main__left-list')) {
                dndReplace(leftArray, currentDrag.node)
            }
        }
    }

    currentDrag = null;
});


function getCurrentZone(from, className) {
    do {
        if (from.classList.contains(className)) {
            return from;
        }
    } while (from = from.parentElement);

    return null;
}

function getDescendant(from, descendant) {
    var childNodes = from.children;

    if (from.classList.contains(descendant)) {

        return from;
    }
    for (var i = 0; i < childNodes.length; i++) {
        if (from.firstElementChild) {
            getDescendant(from.firstElementChild, descendant);
        } else {

            return null;
        }
    }
}

//////////////////// Строка поиска ///////////////////////

const leftInput = document.querySelector('#left-input');
const rightInput = document.querySelector('#right-input');


leftInput.addEventListener('input', (e) => {
    filterSearch(e, leftArray, rightArray);
});
rightInput.addEventListener('input', (e) => {

    filterSearch(e, rightArray, leftArray);
});


function filterSearch(e, arr1, arr2) {
    if (e.target.value) {

        for (var i = 0; i < arr2.length; i++) {
            arr1[i].style.cssText = 'display:none';
            if (arr2[i].style.display == 'none' && isMatching(arr2[i].textContent, e.target.value)) {
                arr1[i].style.cssText = 'display: "";';
            }
        }
    }
    if (e.target.value == '') {
        for (var i = 0; i < arr2.length; i++) {
            if (arr2[i].style.display == 'none') {
                arr1[i].style.cssText = 'display: "";';
            }
        }
    }
}

function isMatching(full, chunk) {
    return (~full.toLowerCase().indexOf(chunk.toLowerCase())) ? true : false;
}

///////////////////////////// Сохранение ///////////////////////////////////////

var save = document.querySelector('.footer__save');
var closeBtn = document.querySelector('.header__close');

closeBtn.addEventListener('click', (e) => {
    e.preventDefault();

    localStorage.clear();
    for (var i = 0; i < leftArray.length; i++) {
        leftArray[i].style.cssText = 'display: "";';
        rightArray[i].style.cssText = 'display: none;';
    }
})
save.addEventListener('click', (e) => {

    var a = leftArray.map((a) => {
        return a.style.display;
    });

    var b = rightArray.map((b) => {
        return b.style.display;
    });

    localStorage.setItem('left', JSON.stringify(a))
    localStorage.setItem('right', JSON.stringify(b))
});

function localStorageLoad() {
    
    if (localStorage.length !== 0) {
        var a = JSON.parse(localStorage.getItem('left'))
        var b = JSON.parse(localStorage.getItem('right'))

        for(var i = 0; i < leftArray.length; i++){
            leftArray[i].style.display = a[i];
            rightArray[i].style.display = b[i];
        }
    } 
};

