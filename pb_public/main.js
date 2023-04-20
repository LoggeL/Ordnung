const pb = new PocketBase()

// Blacklist columns
const blacklist = ['collectionId', 'collectionName', 'created', 'id', 'expand']
let collections = {}

class BtnCellRenderer {
  constructor() {
    this.eGui = null
    this.btnClickedHandler = this.btnClickedHandler.bind(this)
  }

  init(params) {
    this.params = params

    this.eGui = document.createElement('button')
    this.eGui.classList.add('small')
    this.eGui.style['margin-top'] = '5px'
    if (this.params.value === '') this.eGui.setAttribute('disabled', 'true')
    this.eGui.innerText = this.params.value === '' ? 'No URL' : 'Open'

    this.eGui.addEventListener('click', this.btnClickedHandler)
  }

  getGui() {
    return this.eGui
  }

  btnClickedHandler(event) {
    this.params.clicked(this.params.value)
  }

  destroy() {
    this.eGui.removeEventListener('click', this.btnClickedHandler)
  }
}

pb.admins
  .authWithPassword('logge@duck.com', '404noswagfound')
  .then(() => {
    // Get all collections
    pb.collections.getFullList().then((data) => {
      console.log(data)

      data.forEach((collection) => {
        if (collection.type !== 'base') return

        collections[collection.name] = collection

        const row = document.createElement('a')
        row.classList.add('row', 'round')
        row.innerHTML = `
          <i>inbox</i>
          <span>${collection.name}</span>
        `
        row.addEventListener('click', () => {
          loadCollection(collection.name)
        })

        document.getElementById('collections').appendChild(row)
      })
    })

    console.log('Logged in')
  })
  .catch((err) => {
    console.log(err)
  })

function loadCollection(collectionName) {
  document.getElementById('grid').innerHTML = ''

  document.getElementById('name').innerText = collectionName

  // Close sidebar
  document.getElementById('collections').classList.remove('active')

  pb.collection(collectionName)
    .getFullList()
    .then((data) => {
      console.log(data)

      // Create column definitions

      console.log(collections[collectionName].schema)
      const columnDefs = Object.values(collections[collectionName].schema).map(
        (val) => {
          switch (val.type) {
            case 'text':
              return { field: val.name, sortable: true, type: val.type }
            case 'url':
              return {
                field: val.name,
                cellRenderer: BtnCellRenderer,
                cellRendererParams: {
                  clicked: function (field) {
                    window.open(field, '_blank')
                  },
                },
              }
            default:
              return { field: val.name, sortable: true, type: val.type }
          }
        }
      )

      // Remove blacklisted columns
      const columnDefsFiltered = columnDefs.filter(
        (e) => !blacklist.includes(e.field)
      )

      const rowData = data

      const defaultColDef = {
        // make every column editable
        editable: true,
        // make columns resizable
        resizable: true,
      }

      // let the grid know which columns and what data to use
      const gridOptions = {
        columnDefs: columnDefsFiltered,
        rowData: rowData,
        defaultColDef: defaultColDef,
      }

      // setup the grid after the page has finished loading
      const gridDiv = document.getElementById('grid')
      new agGrid.Grid(gridDiv, gridOptions)
    })
    .catch((err) => {
      console.log(err)
    })
}
