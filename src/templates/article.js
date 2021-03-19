import React, {useState, useEffect} from "react";
import {graphql} from "gatsby";
import Img from "gatsby-image";
import Moment from "react-moment";
import Layout from "../components/layout";
import Markdown from "react-markdown";

export const query = graphql`
  query ArticleQuery($slug: String!) {
    strapiArticle(slug: { eq: $slug }, status: { eq: "published" }) {
      strapiId
      title
      description
      content
      publishedAt
      image {
        publicURL
        childImageSharp {
          fixed {
            src
          }
        }
      }
      author {
        name
        picture {
          childImageSharp {
            fixed(width: 30, height: 30) {
              src
            }
          }
        }
      }
    }
  }
`;


const Article = ({data}) => {
    const article = data.strapiArticle;
    const seo = {
        metaTitle: article.title,
        metaDescription: article.description,
        shareImage: article.image,
        article: true,
    };

    const [commentaires, setCommentaires] = useState([])

    const fetchCommentaires = () => {
        fetch("https://lsf4all-strapi.herokuapp.com/commentaires?article=" + article.strapiId)
            .then(reponse => reponse.json())
            .then( comms => {
                const commentairesAAfficher = comms.map((comm) => {
                    const date = new Date(comm.published_at).toLocaleString("fr")
                    return (
                        <div className="commentaire">
                            <div className="auteur">{comm.auteur}</div>
                            <div className="texte">{comm.texte}</div>
                            <div className="date">{date}</div>
                            <hr />
                        </div>
                    )
                })
                setCommentaires(commentairesAAfficher)
            })
    }


    const submitComm = (event) => {
        event.preventDefault();
        const auteur = event.target.auteur.value
        const texte = event.target.texte.value

        const comm = {
            auteur: auteur,
            texte: texte,
            article: article.strapiId,
        }

        fetch("https://lsf4all-strapi.herokuapp.com/commentaires", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(comm),
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                fetchCommentaires();
            }).catch(err => console.error)
    }
    useEffect(fetchCommentaires, [article])


    return (
        <Layout seo={seo}>
            <div>
                <div
                    id="banner"
                    className="uk-height-medium uk-flex uk-flex-center uk-flex-middle uk-background-cover uk-light uk-padding uk-margin"
                    data-src={article.image.publicURL}
                    data-srcset={article.image.publicURL}
                    data-uk-img
                >
                    <h1>{article.title}</h1>
                </div>

                <div className="uk-section">
                    <div className="uk-container uk-container-small">
                        <Markdown source={article.content} escapeHtml={false}/>

                        <hr className="uk-divider-small"/>

                        <div className="uk-grid-small uk-flex-left" data-uk-grid="true">
                            <div>
                                {article.author.picture && (
                                    <Img
                                        fixed={article.author.picture.childImageSharp.fixed}
                                        imgStyle={{position: "static", borderRadius: "50%"}}
                                    />
                                )}
                            </div>
                            <div className="uk-width-expand">
                                <p className="uk-margin-remove-bottom">
                                    By {article.author.name}
                                </p>
                                <p className="uk-text-meta uk-margin-remove-top">
                                    <Moment format="MMM Do YYYY">{article.published_at}</Moment>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <form onSubmit={submitComm}>
                    <input type={"text"} name={"auteur"}/>
                    <input type={"text"} name={"texte"}/>
                    <button type={"submit"}>Envoyer</button>
                </form>
                <div className={"commentaires"}>
                    {commentaires}
                </div>
            </div>
        </Layout>
    );
};

export default Article;