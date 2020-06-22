# Mercadotest
Test práctico para aspirantes al área de front-end de Mercado Libre

## Decisiones de implementación

Se utilizaron links a fonts (variacions de Proxima Nova) mediante links a los fonts en Mercado Libre. 

En el endpoint que provee resultados de búsqueda, se agregó un campo "state" (conteniendo la provincia en la que se encuentra cada ítem). Este campo no fue solicitado en las especificaciones, pero es utilizado en la página que muestra los resultados de búsqueda. Esto simplifica el rendering de los resultados (evita múltiples llamadas a la API de ML).

En el endpoint que provee la información de un ítem individual, se agregó un campo adicional (category_id) con el ID de la categoría a la que pertenece el ítem. De esta forma, se facilita el rendering del camino de categorías del production (path_from_root). También se agregó un endpoint para obtener la información sobre las categorías en base a su ID.

Se crearon 2 endpoints para obtener información sobre las monedas habilitadas en ML, uno para el listado de todas las monedas y el otro para una moneda individual, en base a su ID. Estos endpoints facilitan el rendering de los precios (el símbolo de cada moneda). El endpoint que obtiene el listado de las monedas se utiliza para mejorar la performance del endpoint que obtiene resultados de búsquedas, al evitar tener que hacer una llamada HTTP por cada ítem.

Las imágenes devueltas en los endpoints para obtener resultados de búsqueda e ítems individuales son procesadas para devolver thumbnails e imágenes de buena calidad (ancho y alto), haciendo uso de las "variations" de las imágenes que provee ML.

Los datos en "author" se toman de un archivo de configuración (/config/default.json), al igual que las URLs de las API de ML y otros datos de configuración.

## Posibles optimizaciones

Actualmente, las APIs no devuelven la totalidad de los datos necesarios para mostrar los datos en el frontend. Esto hace que haya que realizar llamadas adicionales a la API de ML, haciendo más lento el rendering. Se podrían agregar los campos faltantes, para así evitar estas llamadas y mejorar la performance.

Se podría mejorar la performance del display de ítems individuales (entre los que se muestran en la página de resultados), guardando el resultado de la búsqueda (agregando a los resultados los campos que falten) para así evitar tener que llamar a la API antes de mostrar los productos. Esto se podría realizar utilizando herramientas como "Redux".

Se podría mejorar la performance del rendering de las páginas utilizando server-side rendering (por ejemplo, usando el método "hydrate" de ReactDOM en lugar de render). Esto sería muy útil en dispositivos móviles, ya que tienen menor poder de procesamiento (y en caso de utilizar redes móviles, menos velocidad de navegación). Al proveer componentes ya renderizados, se mejoraría mucho la performance. 

Los endpoints de la API podrían refactorizarse para utilizar servicios Cloud, tales como "Google Functions" o "AWS Lambda". Esto permitiría mejorar la performance y escalabilidad.