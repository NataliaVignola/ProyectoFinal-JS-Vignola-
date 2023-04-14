let stock = []

fetch('/data.json')
    .then((res) => res.json())
    .then((stock) => {
        console.log(stock)

        //Filtrado de objetos según categoría
        const stockBolsas = stock.filter((item) => item.categoria === "Bolsa de café");
        const stockSuscripcion = stock.filter((item) => item.categoria === "Suscripción");

        let btnBolsas = document.querySelector('#btn-bolsas')
        let btnSuscripcion = document.querySelector('#btn-suscripcion')
        let btnTodo = document.querySelector('#btn-todo')


        let carrito = [];
        const divisa = '$';
        const DOMitems = document.querySelector('#items');
        const DOMcarrito = document.querySelector('#carrito');
        const DOMtotal = document.querySelector('#total');
        const DOMbotonVaciar = document.querySelector('#boton-vaciar');
        const DOMbotonFinalizarCompra = document.getElementById('btnFinalizarCompra');
        const miLocalStorage = window.localStorage;
        const productContainer = document.querySelector('.product-container');


        //Función para visualizar los productos en el html
        function renderizarProductos(categoriaProductos) {
            categoriaProductos.forEach((producto) => {
                // Estructura
                const miNodo = document.createElement('div');
                miNodo.classList.add('card', 'total-carrito');
                //Body
                const miNodoCardBody = document.createElement('div');
                miNodoCardBody.classList.add('card-body');
                //Categoría
                const miNodoCategoria = document.createElement('h3');
                miNodoCategoria.classList.add('card-categoria');
                miNodoCategoria.textContent = `${producto.categoria}`;
                //Tipo de producto
                const miNodoTipo = document.createElement('p');
                miNodoTipo.classList.add('card-tipo');
                miNodoTipo.textContent = `${producto.tipo}`;
                //Nombre del producto
                const miNodoNombre = document.createElement('h4');
                miNodoNombre.classList.add('card-name');
                miNodoNombre.textContent = `${producto.nombre}`;
                //Precio unitario de producto
                const miNodoPrecio = document.createElement('p');
                miNodoPrecio.classList.add('card-precio');
                miNodoPrecio.textContent = `${divisa} ${producto.precio}`;
                //Botón para agregar al carrito
                const miNodoBoton = document.createElement('button');
                miNodoBoton.classList.add('add-btn', 'btn-primary');
                miNodoBoton.textContent = 'Agregar al carrito';
                miNodoBoton.setAttribute('marcador', producto.id);
                miNodoBoton.addEventListener('click', agregarAlCarrito);
                //Imagen del producto
                const miNodoImagen = document.createElement('img');
                miNodoImagen.classList.add('card-img');
                miNodoImagen.src = `./img/${producto.imagen}`;
                // DOM
                miNodoCardBody.appendChild(miNodoCategoria);
                miNodoCardBody.appendChild(miNodoTipo);
                miNodoCardBody.appendChild(miNodoImagen);
                miNodoCardBody.appendChild(miNodoNombre);
                miNodoCardBody.appendChild(miNodoPrecio);
                miNodoCardBody.appendChild(miNodoBoton);
                miNodo.appendChild(miNodoCardBody);
                DOMitems.appendChild(miNodo);
            });
        }

        //Función para visualizar productos filtrados por categoría
        function productosFiltrados(item) {
            productContainer.innerHTML = '';
            renderizarProductos(item);
        }

        //Función que agrega producto al carrito
        function agregarAlCarrito(e) {
            carrito.push(e.target.getAttribute('marcador'))
            renderizarCarrito();
            guardarCarritoEnLocalStorage();
        }

        //Función para contar productos del carrito
        function contarProductos() {
            let contadorDeProductos = document.querySelector('#contador-productos')
            let totalProductos = carrito.length;

            contadorDeProductos.innerText = totalProductos;
        }

        //Función para ver el carrito y su contenido 
        function renderizarCarrito() {

            DOMcarrito.textContent = '';

            const carritoSinDuplicados = [...new Set(carrito)];

            carritoSinDuplicados.forEach((item) => {
                const miItem = stock.filter((itemStock) => {
                    return itemStock.id === parseInt(item);
                });
                const numeroUnidadesItem = carrito.reduce((total, itemId) => {
                    return itemId === item ? total += 1 : total;
                }, 0);

                const cardCarrito = document.createElement('li');
                cardCarrito.classList.add('card-carrito');

                cardCarrito.innerHTML = `
        <div class='cart-name'>
            <h3 class='cart-categoria'>${miItem[0].tipo}</h3>
            <h3 class='cart-categoria'>${miItem[0].nombre}</h3>
            <h4 class="cart-quantity cart-categoria"> x ${numeroUnidadesItem} </h4>
        </div>

        <h4 class="cart-price cart-categoria"> $ ${miItem[0].precio}</h4>`

                //Botón bote de basura, para borrar item del carrito
                const removebtn = document.createElement('button');
                removebtn.classList.add('btn', 'btn-eliminar');
                removebtn.innerHTML = `<img class="img-bote" id="${item}" src=./img/bote-basura.svg alt="">`;
                removebtn.style.marginLeft = '1rem';
                removebtn.addEventListener('click', borrarItemCarrito)
                cardCarrito.appendChild(removebtn);
                DOMcarrito.appendChild(cardCarrito);
            });

            DOMtotal.textContent = calcularTotal();

            contarProductos()
        }

        //Función para borrar producto del carrito
        function borrarItemCarrito(e) {
            const id = e.target.id;
            carrito = carrito.filter((carritoId) => {
                return carritoId !== id;
            });
            renderizarCarrito();
            guardarCarritoEnLocalStorage();

        }

        //Función calcular total
        function calcularTotal() {
            return carrito.reduce((total, item) => {
                const miItem = stock.filter((itemStock) => {
                    return itemStock.id === parseInt(item);
                });
                return total + miItem[0].precio;
            }, 0).toFixed(2);
        }

        //Función para vaciar el carrito con alerta 
        function vaciarCarrito() {

            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                    confirmButton: 'btn btn-success',
                    cancelButton: 'btn btn-danger'
                },
                buttonsStyling: false
            })

            swalWithBootstrapButtons.fire({
                title: 'Estás a punto de vaciar tu carrito de compras',
                text: "¿Querés vaciarlo:(?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Si, vaciar mi carrito.',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    carrito = [];
                    renderizarCarrito();
                    localStorage.clear();
                    swalWithBootstrapButtons.fire(
                        'Tu carrito ahora está vacío',
                    )
                } else if (
                    result.dismiss === Swal.DismissReason.cancel
                ) {
                    swalWithBootstrapButtons.fire(
                        'Vaciado cancelado'
                    )
                }
            })

        }

        function finalizarCompra() {

            const total = calcularTotal();

            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                    confirmButton: 'btn btn-success',
                    cancelButton: 'btn btn-danger'
                },
                buttonsStyling: false
            })

            swalWithBootstrapButtons.fire({
                title: '¿Deseas finalizar la compra?',
                text: 'Esto cerrará tu carrito',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, finalizar compra.',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    carrito = [];
                    renderizarCarrito();
                    localStorage.clear();
                    swalWithBootstrapButtons.fire(
                        '¡Gracias por tu comra!',
                        `El total a pagar es $${total}`,
                        'success'
                    )
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    swalWithBootstrapButtons.fire(
                        'Compra cancelada',
                        '',
                        'error'
                    )
                }
            })
        }

        //Función para guardar carrito en el Local Storage
        function guardarCarritoEnLocalStorage() {
            miLocalStorage.setItem('carrito', JSON.stringify(carrito));
        }

        //Función para traer carrito en el Local Storage
        function cargarCarritoDeLocalStorage() {
            if (miLocalStorage.getItem('carrito') !== null) {
                carrito = JSON.parse(miLocalStorage.getItem('carrito'));
            }
        }

        //Eventos

        DOMbotonVaciar.addEventListener('click', vaciarCarrito);
        DOMbotonFinalizarCompra.addEventListener('click', finalizarCompra);

        btnTodo.addEventListener('click', () => productosFiltrados(stock));
        btnBolsas.addEventListener('click', () => productosFiltrados(stockBolsas));
        btnSuscripcion.addEventListener('click', () => productosFiltrados(stockSuscripcion));

        //Inicio
        cargarCarritoDeLocalStorage();
        renderizarCarrito();

    })
    .catch((error) => console.error(error))